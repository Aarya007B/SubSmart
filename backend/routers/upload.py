from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.transaction import Transaction, TransactionResponse
from backend.utils.parser import parse_csv
from backend.utils.detect_recurring import detect_recurring_subscriptions
from typing import List

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=dict)
async def upload_csv(
    file: UploadFile = File(...),
    user_id: int = 1,  # Default user for demo
    db: Session = Depends(get_db)
):
    """
    Upload and parse CSV file containing bank transactions
    
    Args:
        file: CSV file upload
        user_id: User ID (default 1 for demo)
        db: Database session
        
    Returns:
        Dictionary with upload status and transaction count
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read file content
        content = await file.read()
        file_content = content.decode('utf-8')
        
        # Parse CSV
        parsed_transactions = parse_csv(file_content)
        
        if not parsed_transactions:
            raise HTTPException(
                status_code=400, 
                detail="No valid transactions found in CSV"
            )
        
        # Store transactions in database
        stored_count = 0
        for txn_data in parsed_transactions:
            transaction = Transaction(
                date=txn_data['date'],
                description=txn_data['description'],
                amount=txn_data['amount'],
                user_id=user_id
            )
            db.add(transaction)
            stored_count += 1
        
        db.commit()
        
        # After storing transactions, run subscription detection automatically
        # Prepare list for detection (transactions for this user)
        txn_list = [
            {
                'date': t.date,
                'description': t.description,
                'amount': t.amount
            }
            for t in db.query(Transaction).filter(Transaction.user_id == user_id).all()
        ]

        detected = detect_recurring_subscriptions(txn_list)

        created_count = 0
        for sub_data in detected:
            existing = db.query(Subscription).filter(
                Subscription.user_id == user_id,
                Subscription.merchant_name == sub_data['merchant_name']
            ).first()

            if not existing:
                subscription = Subscription(
                    merchant_name=sub_data['merchant_name'],
                    amount=sub_data['amount'],
                    frequency=sub_data['frequency'],
                    start_date=sub_data['start_date'],
                    next_billing_date=sub_data.get('next_billing_date'),
                    status=sub_data['status'],
                    user_id=user_id
                )
                db.add(subscription)
                created_count += 1

        db.commit()

        return {
            "status": "success",
            "message": f"Successfully uploaded and parsed {stored_count} transactions",
            "transaction_count": stored_count,
            "filename": file.filename,
            "detected_count": len(detected),
            "created_count": created_count,
            "subscriptions": detected
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, 
            detail=f"Error processing file: {str(e)}"
        )


@router.get("/transactions", response_model=List[TransactionResponse])
def get_transactions(
    user_id: int = 1,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all transactions for a user
    
    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of transactions
    """
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).offset(skip).limit(limit).all()
    
    return transactions
