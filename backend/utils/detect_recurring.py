import json
import os
import re
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional

import google.generativeai as genai


_GENAI_CONFIGURED = False


def normalize_merchant(description: str) -> str:
    """
    Normalize merchant name for matching
    
    Args:
        description: Raw transaction description
        
    Returns:
        Normalized merchant name
    """
    if not description:
        return "unknown"
    
    # Convert to lowercase and strip
    normalized = description.lower().strip()
    
    # Remove common patterns
    patterns = [
        r'\d{2}/\d{2}',  # Dates
        r'#\d+',  # Reference numbers
        r'\*+\d+',  # Card numbers
        r'ref\s*:?\s*\w+',  # Reference codes
    ]
    
    for pattern in patterns:
        normalized = re.sub(pattern, '', normalized)
    
    # Remove special characters except spaces
    normalized = re.sub(r'[^a-z0-9\s]', ' ', normalized)
    
    # Remove extra whitespace
    normalized = ' '.join(normalized.split())
    
    return normalized.strip()


def detect_recurring_subscriptions(transactions: List[Dict]) -> List[Dict]:
    """Detect recurring subscriptions, preferring Gemini-based analysis."""
    gemini_result = _detect_recurring_with_gemini(transactions)

    if gemini_result is not None:
        print(f"DEBUG: Gemini-based detector returned {len(gemini_result)} subscriptions")
        return gemini_result

    print("DEBUG: Falling back to heuristic detector")
    return _detect_recurring_locally(transactions)


def _detect_recurring_with_gemini(transactions: List[Dict]) -> Optional[List[Dict]]:
    """Use Gemini to analyse transactions. Returns None on failure to fall back."""
    if not transactions:
        print("DEBUG: No transactions provided for Gemini detector")
        return []

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("DEBUG: GEMINI_API_KEY not set; skipping Gemini-based detection")
        return None

    if not _configure_genai(api_key):
        return None

    try:
        model = genai.GenerativeModel("gemini-2.0-flash")

        instruction = (
            "You are a financial data analyst. Given a list of bank transactions "
            "in JSON, identify recurring subscription payments. Output ONLY a JSON array of objects."
            "Each object must include: merchant_name (string), amount (number), frequency "
            "(weekly, bi-weekly, monthly, yearly), start_date (YYYY-MM-DD), next_billing_date "
            "(YYYY-MM-DD or null), status ('active' or 'cancelled'), and transaction_count (integer)."
        )

        transactions_snippet = json.dumps(transactions[:100])  # guard against very large payloads
        response = model.generate_content([
            instruction,
            f"Transactions:\n{transactions_snippet}",
        ])

        response_text = getattr(response, "text", "").strip()
        if not response_text:
            print("DEBUG: Empty response from Gemini detector")
            return None

        json_match = re.search(r"\[.*\]", response_text, re.DOTALL)
        if not json_match:
            print(f"DEBUG: Gemini response missing JSON array: {response_text[:200]}")
            return None

        raw_items = json.loads(json_match.group())

    except Exception as exc:
        print(f"DEBUG: Gemini detection failed: {exc}")
        return None

    if not isinstance(raw_items, list):
        print("DEBUG: Gemini response is not a list; falling back")
        return None

    sanitized: List[Dict] = []

    for idx, item in enumerate(raw_items):
        try:
            merchant = str(item.get("merchant_name") or "").strip()
            start_date = str(item.get("start_date") or "").strip()
            amount = float(item.get("amount"))
            frequency = _normalize_frequency(item.get("frequency"))

            if not merchant or not start_date or amount <= 0 or not frequency:
                print(f"DEBUG: Gemini item {idx} missing required fields; skipping")
                continue

            subscription: Dict = {
                "merchant_name": merchant.title(),
                "amount": round(amount, 2),
                "frequency": frequency,
                "start_date": start_date,
                "status": _normalize_status(item.get("status")),
                "transaction_count": int(item.get("transaction_count") or 0),
            }

            next_billing = item.get("next_billing_date")
            subscription["next_billing_date"] = str(next_billing).strip() if next_billing else None

            sanitized.append(subscription)

        except Exception as parse_error:
            print(f"DEBUG: Unable to parse Gemini item {idx}: {parse_error}")
            continue

    print(f"DEBUG: Gemini sanitized {len(sanitized)} subscriptions")
    return sanitized


def _configure_genai(api_key: str) -> bool:
    """Configure Gemini client once."""
    global _GENAI_CONFIGURED
    if _GENAI_CONFIGURED:
        return True

    try:
        genai.configure(api_key=api_key)
        _GENAI_CONFIGURED = True
        return True
    except Exception as exc:
        print(f"DEBUG: Failed to configure Gemini client: {exc}")
        return False


def _normalize_frequency(value) -> Optional[str]:
    mapping = {
        "weekly": "weekly",
        "week": "weekly",
        "bi-weekly": "bi-weekly",
        "biweekly": "bi-weekly",
        "fortnightly": "bi-weekly",
        "monthly": "monthly",
        "month": "monthly",
        "yearly": "yearly",
        "annual": "yearly",
        "annually": "yearly",
    }

    if value is None:
        return None

    frequency = str(value).strip().lower()
    return mapping.get(frequency, "monthly")


def _normalize_status(value) -> str:
    if not value:
        return "active"
    status = str(value).strip().lower()
    return status if status in {"active", "cancelled"} else "active"


def _detect_recurring_locally(transactions: List[Dict]) -> List[Dict]:
    """
    Detect recurring subscriptions from transaction list
    
    Args:
        transactions: List of transaction dictionaries with date, description, amount
        
    Returns:
        List of detected subscription dictionaries
    """
    if not transactions:
        print("DEBUG: No transactions provided")
        return []
    
    print(f"DEBUG: Processing {len(transactions)} transactions")
    
    # Group transactions by merchant name (description field)
    merchant_groups = defaultdict(list)
    
    for transaction in transactions:
        merchant = transaction.get('description', 'unknown')
        if merchant:
            merchant_groups[merchant].append(transaction)
    
    print(f"DEBUG: Found {len(merchant_groups)} unique merchants")
    
    subscriptions = []
    
    for merchant, txns in merchant_groups.items():
        print(f"DEBUG: Analyzing merchant '{merchant}' with {len(txns)} transactions")
        
        # Need at least 2 transactions to detect pattern
        if len(txns) < 2:
            print(f"  -> Skipping: Less than 2 transactions")
            continue
        
        # Sort by date
        try:
            txns_sorted = sorted(txns, key=lambda x: datetime.strptime(str(x['date']), '%Y-%m-%d'))
        except Exception as e:
            print(f"  -> Skipping: Date sorting error: {e}")
            continue
        
        print(f"  -> Date range: {txns_sorted[0]['date']} to {txns_sorted[-1]['date']}")
        
        # Check for recurring pattern
        is_recurring, frequency = check_recurring_pattern(txns_sorted)
        
        if is_recurring:
            # Get most recent amount (handle slight variations)
            recent_amounts = [t['amount'] for t in txns_sorted[-3:]]
            avg_amount = sum(recent_amounts) / len(recent_amounts)
            
            # Calculate next billing date
            last_txn = txns_sorted[-1]
            try:
                last_date = datetime.strptime(str(last_txn['date']), '%Y-%m-%d')
                if frequency == 'monthly':
                    next_billing = last_date + timedelta(days=30)
                elif frequency == 'yearly':
                    next_billing = last_date + timedelta(days=365)
                elif frequency == 'weekly':
                    next_billing = last_date + timedelta(days=7)
                elif frequency == 'bi-weekly':
                    next_billing = last_date + timedelta(days=14)
                else:
                    next_billing = None
            except:
                next_billing = None
            
            sub_dict = {
                'merchant_name': merchant.title(),
                'amount': round(avg_amount, 2),
                'frequency': frequency,
                'start_date': txns_sorted[0]['date'],
                'next_billing_date': next_billing.strftime('%Y-%m-%d') if next_billing else None,
                'status': 'active',
                'transaction_count': len(txns_sorted)
            }
            
            print(f"  -> DETECTED: {frequency} subscription - {merchant.title()} (${avg_amount:.2f})")
            subscriptions.append(sub_dict)
        else:
            print(f"  -> No recurring pattern detected")
    
    print(f"DEBUG: Total subscriptions detected: {len(subscriptions)}")
    return subscriptions


def check_recurring_pattern(transactions: List[Dict]) -> tuple:
    """
    Check if transactions show recurring pattern.
    Handles multiple transactions on same date by deduplicating per date.
    
    Args:
        transactions: Sorted list of transactions
        
    Returns:
        Tuple of (is_recurring, frequency)
    """
    if len(transactions) < 2:
        return False, None
    
    # Group transactions by date (to handle same-day duplicates)
    unique_dates = []
    last_date = None
    for tx in transactions:
        tx_date = str(tx['date'])
        if tx_date != last_date:
            unique_dates.append(tx_date)
            last_date = tx_date
    
    # Now calculate gaps between unique dates only
    gaps = []
    for i in range(1, len(unique_dates)):
        try:
            date1 = datetime.strptime(unique_dates[i-1], '%Y-%m-%d')
            date2 = datetime.strptime(unique_dates[i], '%Y-%m-%d')
            gap = (date2 - date1).days
            if gap > 0:  # Only count positive gaps
                gaps.append(gap)
        except Exception as e:
            continue
    
    if not gaps:
        return False, None
    
    print(f"    -> Unique dates: {len(unique_dates)}, Gap analysis (filtered): {gaps[:10]}...")  # Show first 10
    
    # Check for monthly pattern (28-35 days, allowing for variation)
    monthly_gaps = [g for g in gaps if 25 <= g <= 35]
    if len(monthly_gaps) >= len(gaps) * 0.6:  # 60% of gaps are monthly (relaxed from 0.7)
        print(f"    -> Detected MONTHLY pattern ({len(monthly_gaps)}/{len(gaps)} gaps)")
        return True, 'monthly'
    
    # Check for yearly pattern (350-380 days)
    yearly_gaps = [g for g in gaps if 350 <= g <= 380]
    if len(yearly_gaps) >= len(gaps) * 0.6:
        print(f"    -> Detected YEARLY pattern ({len(yearly_gaps)}/{len(gaps)} gaps)")
        return True, 'yearly'
    
    # Check for weekly pattern (6-8 days)
    weekly_gaps = [g for g in gaps if 6 <= g <= 8]
    if len(weekly_gaps) >= len(gaps) * 0.6:
        print(f"    -> Detected WEEKLY pattern ({len(weekly_gaps)}/{len(gaps)} gaps)")
        return True, 'weekly'
    
    # Check for bi-weekly pattern (13-15 days)
    biweekly_gaps = [g for g in gaps if 13 <= g <= 15]
    if len(biweekly_gaps) >= len(gaps) * 0.6:
        print(f"    -> Detected BI-WEEKLY pattern ({len(biweekly_gaps)}/{len(gaps)} gaps)")
        return True, 'bi-weekly'
    
    print(f"    -> Gap distribution: monthly={len(monthly_gaps)}, yearly={len(yearly_gaps)}, weekly={len(weekly_gaps)}, biweekly={len(biweekly_gaps)}")
    return False, None
