import csv
from datetime import datetime
from typing import List, Dict
import re
from io import StringIO


def parse_csv(file_content: str) -> List[Dict[str, any]]:
    """
    Parse CSV content and extract Date, Description, Amount
    Expected format: date,description,amount
    
    Args:
        file_content: CSV file content as string
        
    Returns:
        List of transaction dictionaries with date, description, amount
    """
    transactions = []
    
    try:
        # Handle both string and bytes input
        if isinstance(file_content, bytes):
            file_content = file_content.decode('utf-8')
        
        # Use StringIO for CSV parsing
        csv_reader = csv.DictReader(StringIO(file_content))
        
        if not csv_reader.fieldnames:
            print("ERROR: No CSV headers found")
            return []
        
        print(f"DEBUG: CSV Headers detected: {csv_reader.fieldnames}")
        
        for row_idx, row in enumerate(csv_reader):
            try:
                # Skip empty rows
                if not row or all(not v for v in row.values()):
                    continue
                
                print(f"DEBUG: Processing row {row_idx}: {row}")
                
                # Extract fields (case-insensitive column matching)
                date_str = None
                description = None
                amount_str = None
                
                for key, value in row.items():
                    if not key:
                        continue
                    
                    key_lower = key.lower().strip()
                    
                    # Skip empty values
                    if not value or str(value).strip() == "":
                        continue
                    
                    # Match columns
                    if "date" in key_lower:
                        date_str = str(value).strip()
                    elif "description" in key_lower or "merchant" in key_lower or "payee" in key_lower:
                        description = str(value).strip()
                    elif "amount" in key_lower or "value" in key_lower or "charge" in key_lower:
                        amount_str = str(value).strip()
                
                # Validate required fields
                if not date_str:
                    print(f"  -> Skipping: No date found")
                    continue
                if not description:
                    print(f"  -> Skipping: No description found")
                    continue
                if not amount_str:
                    print(f"  -> Skipping: No amount found")
                    continue
                
                # Parse date
                parsed_date = parse_date(date_str)
                if not parsed_date:
                    print(f"  -> Skipping: Could not parse date '{date_str}'")
                    continue
                
                # Parse amount
                amount = clean_amount(amount_str)
                if amount is None or amount <= 0:
                    print(f"  -> Skipping: Invalid amount '{amount_str}'")
                    continue
                
                # Clean description
                cleaned_desc = clean_description(description)
                
                tx = {
                    'date': str(parsed_date),
                    'description': cleaned_desc,
                    'amount': abs(float(amount))
                }
                
                print(f"  -> Added transaction: {tx}")
                transactions.append(tx)
                
            except Exception as row_error:
                print(f"DEBUG: Error processing row {row_idx}: {str(row_error)}")
                continue
        
        print(f"DEBUG: Total transactions parsed: {len(transactions)}")
        return transactions
        
    except Exception as e:
        print(f"ERROR in parse_csv: {str(e)}")
        import traceback
        traceback.print_exc()
        return []


def parse_date(date_str: str) -> datetime.date:
    """Parse date string with multiple format support"""
    date_formats = [
        '%Y-%m-%d',
        '%m/%d/%Y',
        '%d/%m/%Y',
        '%m-%d-%Y',
        '%d-%m-%Y',
        '%Y/%m/%d',
        '%b %d, %Y',
        '%B %d, %Y',
        '%d %b %Y',
        '%d %B %Y'
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except ValueError:
            continue
    
    return None


def clean_amount(amount_str: str) -> float:
    """Clean and parse amount string"""
    if not amount_str:
        return None
    # Remove common currency symbols (₹, £, $, €), 3-letter currency codes (INR, USD), commas and spaces
    cleaned = str(amount_str).strip()
    # Remove 3-letter currency codes (case-insensitive)
    cleaned = re.sub(r'\b[A-Za-z]{3}\b', '', cleaned)
    # Remove currency symbols and commas/spaces
    cleaned = re.sub(r'[\u20b9£$€,\s]', '', cleaned)

    # Handle parentheses for negative amounts
    if '(' in cleaned and ')' in cleaned:
        cleaned = '-' + cleaned.replace('(', '').replace(')', '')

    try:
        return float(cleaned)
    except ValueError:
        return None


def clean_description(description: str) -> str:
    """Clean and normalize description"""
    # Remove extra whitespace
    cleaned = ' '.join(description.split())
    
    # Remove common prefixes
    prefixes = ['PURCHASE AT', 'PAYMENT TO', 'DEBIT CARD', 'ONLINE PAYMENT']
    for prefix in prefixes:
        if cleaned.upper().startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
    
    return cleaned
