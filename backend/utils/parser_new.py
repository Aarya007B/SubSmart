import os
import json
import re
import tempfile
import google.generativeai as genai


def parse_file(file_contents, file_name):
    """Parse CSV/PDF file using Gemini API to extract transactions."""
    try:
        # Initialize Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY not set in environment")
        
        genai.configure(api_key=api_key)
        
        # Create temp file
        with tempfile.NamedTemporaryFile(suffix=os.path.splitext(file_name)[1], delete=False) as tmp:
            if isinstance(file_contents, bytes):
                tmp.write(file_contents)
            else:
                tmp.write(file_contents.encode())
            temp_path = tmp.name
        
        try:
            # Upload file to Gemini
            print(f"DEBUG: Uploading file {file_name} to Gemini")
            file = genai.upload_file(temp_path)
            
            # Create prompt for Gemini
            prompt = """Extract all transactions from this document. For each transaction, return a JSON array with objects containing:
- date (YYYY-MM-DD format if possible, otherwise keep original format)
- description (merchant/payee name, keep it clear and concise)
- amount (positive number only, no currency symbols)

Return ONLY the JSON array, no other text or explanation.
Example: [{"date": "2025-11-20", "description": "Amazon", "amount": 49.99}, {"date": "2025-11-21", "description": "Starbucks", "amount": 5.50}]"""
            
            # Call Gemini with file
            print(f"DEBUG: Calling Gemini API to parse transactions")
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content([prompt, file])
            
            # Parse response
            response_text = response.text.strip()
            print(f"DEBUG: Gemini response: {response_text[:200]}")
            
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if not json_match:
                raise ValueError("No valid transaction data found in Gemini response")
            
            transactions = json.loads(json_match.group())
            
            if not transactions:
                raise ValueError("No valid transactions found")
            
            print(f"DEBUG: Parsed {len(transactions)} transactions via Gemini")
            return transactions
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
        
    except Exception as e:
        error_msg = f"File parse error: {str(e)}"
        print(f"DEBUG: {error_msg}")
        raise ValueError(error_msg)


def parse_csv(file_contents):
    """Parse CSV file and extract transactions using Gemini API."""
    return parse_file(file_contents, "file.csv")
