from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.utils.parser import parse_csv
from backend.utils.parser_new import parse_file
from backend.utils.detect_recurring import detect_recurring_subscriptions
import sqlite3
from pathlib import Path

router = APIRouter()

@router.post("/api/upload")
async def upload_csv(file: UploadFile = File(...), user_id: int = 1):
    """Upload CSV and automatically detect subscriptions."""
    try:
        print(f"\n=== UPLOAD START ===")
        print(f"Filename: {file.filename}")
        print(f"User ID: {user_id}, Type: {type(user_id)}")
        
        contents = await file.read()
        print(f"File contents length: {len(contents)}")

        filename = file.filename or "upload"
        suffix = Path(filename).suffix.lower()

        # Parse transactions based on file type
        try:
            if suffix == ".pdf":
                print("DEBUG: Detected PDF upload; delegating to Gemini parser")
                transactions = parse_file(contents, filename)
            else:
                if isinstance(contents, bytes):
                    contents = contents.decode('utf-8')
                transactions = parse_csv(contents)
        except ValueError as e:
            print(f"Parse error: {e}")
            raise HTTPException(status_code=400, detail=str(e))
        
        if not transactions:
            raise HTTPException(status_code=400, detail="No valid transactions found in CSV")
        
        print(f"Parsed {len(transactions)} transactions")
        
        # Store transactions in database
        conn = sqlite3.connect("subsmart.db")
        cur = conn.cursor()
        
        inserted_count = 0
        for idx, tx in enumerate(transactions):
            try:
                print(f"\nProcessing transaction {idx}:")
                print(f"  TX object: {tx}, Type: {type(tx)}")
                
                # Extract values
                date_val = tx.get("date")
                desc_val = tx.get("description")
                amt_val = tx.get("amount")
                
                print(f"  date_val: {date_val}, Type: {type(date_val)}")
                print(f"  desc_val: {desc_val}, Type: {type(desc_val)}")
                print(f"  amt_val: {amt_val}, Type: {type(amt_val)}")
                
                # Validate and convert
                if not isinstance(date_val, str):
                    date_val = str(date_val) if date_val else ""
                if not isinstance(desc_val, str):
                    desc_val = str(desc_val) if desc_val else ""
                if not isinstance(amt_val, float):
                    if isinstance(amt_val, (int, float)):
                        amt_val = float(amt_val)
                    else:
                        print(f"  Skipping: amount is not numeric")
                        continue
                
                date_val = date_val.strip()
                desc_val = desc_val.strip()
                
                if not date_val or not desc_val or amt_val <= 0:
                    print(f"  Skipping: missing required fields")
                    continue
                
                print(f"  Final values:")
                print(f"    user_id: {user_id}, Type: {type(user_id)}")
                print(f"    date_val: '{date_val}', Type: {type(date_val)}")
                print(f"    desc_val: '{desc_val}', Type: {type(desc_val)}")
                print(f"    amt_val: {amt_val}, Type: {type(amt_val)}")
                
                # Insert
                cur.execute(
                    "INSERT INTO transactions (user_id, date, description, amount) VALUES (?, ?, ?, ?)",
                    (user_id, date_val, desc_val, amt_val)
                )
                inserted_count += 1
                print(f"  ✓ Inserted")
                
            except Exception as e:
                print(f"  ✗ Error: {e}")
                import traceback
                traceback.print_exc()
                continue
        
        conn.commit()
        print(f"\nInserted {inserted_count} transactions")
        
        # Run detection on all transactions for this user
        try:
            cur.execute("SELECT date, description, amount FROM transactions WHERE user_id=?", (user_id,))
            rows = cur.fetchall()
            transactions_list = [
                {'date': r[0], 'description': r[1], 'amount': r[2]}
                for r in rows
            ]
            detected = detect_recurring_subscriptions(transactions_list)
        except Exception as e:
            print(f"Detection error: {e}")
            import traceback
            traceback.print_exc()
            detected = []
        
        detected_count = len(detected)
        print(f"Detected {detected_count} subscriptions")
        
        # Store subscriptions
        created_count = 0
        for sub in detected:
            try:
                merchant = str(sub.get("merchant_name", "Unknown")).strip()
                amount = float(sub.get("amount", 0))
                freq = str(sub.get("frequency", "monthly")).strip()
                start_date = str(sub.get("start_date", "")).strip()
                
                cur.execute(
                    "INSERT INTO subscriptions (user_id, merchant_name, amount, frequency, start_date, status) VALUES (?, ?, ?, ?, ?, 'active')",
                    (user_id, merchant, amount, freq, start_date)
                )
                created_count += 1
            except (sqlite3.IntegrityError, ValueError, TypeError) as e:
                print(f"  Subscription error: {e}")
                pass
        
        conn.commit()
        conn.close()
        
        print(f"Created {created_count} subscriptions")
        print(f"=== UPLOAD END ===\n")
        
        return {
            "status": "success",
            "transaction_count": inserted_count,
            "detected_count": detected_count,
            "created_count": created_count,
            "message": f"Uploaded {inserted_count} transactions, detected {detected_count} subscriptions, created {created_count} new subscriptions"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
