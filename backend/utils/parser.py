import csv
from datetime import datetime
from typing import List, Dict
import re


def parse_csv(file_content: str) -> List[Dict[str, any]]:
    """
    Parse CSV content and extract Date, Description, Amount
    
    Args:
        file_content: CSV file content as string
        
    Returns:
        List of transaction dictionaries with date, description, amount
    """
    transactions = []
    csv_reader = csv.DictReader(file_content.splitlines())
    
    for row in csv_reader:
        try:
            # Try to find date column (case-insensitive)
            date_str = None
            for key in row.keys():
                if key.lower() in ['date', 'transaction date', 'trans date']:
                    date_str = row[key]
                    break
            
            # Try to find description column
            description = None
            for key in row.keys():
                if key.lower() in ['description', 'merchant', 'transaction description', 'details']:
                    description = row[key]
                    break
            
            # Try to find amount column
            amount_str = None
            for key in row.keys():
                if key.lower() in ['amount', 'debit', 'withdrawal', 'charge']:
                    amount_str = row[key]
                    break
            
            if not date_str or not description or not amount_str:
                continue
                
            # Parse date - try multiple formats
            parsed_date = parse_date(date_str)
            if not parsed_date:
                continue
            
            # Clean and parse amount
            amount = clean_amount(amount_str)
            if amount is None:
                continue
            
            # Clean description
            description = clean_description(description)
            
            transactions.append({
                'date': parsed_date,
                'description': description,
                'amount': abs(amount)  # Store as positive value
            })
            
        except Exception as e:
            # Skip malformed rows
            continue
    
    return transactions


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
    try:
        # Remove common currency symbols (₹, £, $, €), 3-letter currency codes (INR, USD), commas and spaces
        cleaned = amount_str
        # Remove 3-letter currency codes (case-insensitive)
        cleaned = re.sub(r'\b[A-Za-z]{3}\b', '', cleaned)
        # Remove currency symbols and commas/spaces
        cleaned = re.sub(r'[\u20b9£$€,\s]', '', cleaned)

        # Handle parentheses for negative amounts
        if '(' in cleaned and ')' in cleaned:
            cleaned = '-' + cleaned.replace('(', '').replace(')', '')

        return float(cleaned)
    except:
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
