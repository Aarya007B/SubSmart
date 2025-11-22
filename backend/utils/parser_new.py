import csv
from io import StringIO
import re

def clean_amount(amount_str):
    """Clean amount string: strip currency symbols, convert to float."""
    if amount_str is None:
        return None
    
    # Convert to string
    amount_str = str(amount_str).strip()
    
    if not amount_str:
        return None
    
    # Remove common currency symbols and codes
    amount_str = re.sub(r'[₹$€£]', '', amount_str)
    amount_str = re.sub(r'\s*(INR|USD|EUR|GBP)\s*', '', amount_str)
    amount_str = amount_str.strip()
    
    try:
        val = float(amount_str)
        return val if val > 0 else None
    except (ValueError, TypeError):
        return None


def parse_csv(file_contents):
    """Parse CSV file and extract transactions."""
    try:
        # Decode if bytes
        if isinstance(file_contents, bytes):
            text = file_contents.decode("utf-8")
        else:
            text = str(file_contents)
        
        # Parse CSV
        lines = text.split('\n')
        if not lines or not lines[0]:
            raise ValueError("CSV is empty")
        
        reader = csv.DictReader(StringIO(text))
        
        if not reader.fieldnames:
            raise ValueError("No CSV headers found")
        
        print(f"DEBUG: CSV Headers: {reader.fieldnames}")
        
        transactions = []
        
        for idx, row in enumerate(reader):
            if not row or all(not v for v in row.values()):
                continue
            
            print(f"DEBUG: Row {idx}: {row}")
            
            # Find columns
            date = None
            description = None
            amount = None
            
            for col_name, col_value in row.items():
                if not col_name:
                    continue
                
                col_lower = str(col_name).lower().strip()
                
                # Skip empty values
                if col_value is None or str(col_value).strip() == "":
                    continue
                
                col_value_str = str(col_value).strip()
                
                # Match column names
                if "date" in col_lower:
                    date = col_value_str
                elif "description" in col_lower or "merchant" in col_lower or "payee" in col_lower:
                    description = col_value_str
                elif "amount" in col_lower or "value" in col_lower:
                    amount = clean_amount(col_value_str)
            
            # Only add if all three fields exist
            if date and description and amount:
                tx = {
                    "date": date,
                    "description": description,
                    "amount": amount
                }
                print(f"DEBUG: Adding transaction: {tx}")
                transactions.append(tx)
        
        print(f"DEBUG: Total transactions parsed: {len(transactions)}")
        
        if not transactions:
            raise ValueError(f"No valid transactions found in CSV")
        
        return transactions
        
    except Exception as e:
        error_msg = f"CSV parse error: {str(e)}"
        print(f"DEBUG: {error_msg}")
        raise ValueError(error_msg)
