from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import sqlite3
from typing import List, Optional

router = APIRouter()

class ClassifyResp(BaseModel):
    transaction_id: int
    is_subscription: bool
    confidence: float
    canonical_merchant: Optional[str]
    source: str


def _ensure_table(cur):
    cur.execute("""CREATE TABLE IF NOT EXISTS classification_results (
        transaction_id INTEGER PRIMARY KEY,
        user_id INTEGER,
        is_subscription INTEGER,
        confidence REAL,
        canonical_merchant TEXT,
        source TEXT
    )""")


def classify_transaction(description: Optional[str]):
    if not description:
        return False, 0.0, None
    desc = description.lower()
    keywords = [
        "netflix", "prime", "spotify", "adobe", "microsoft", "gym",
        "disney", "membership", "subscription", "recurring", "auto-renew",
        "auto renew", "monthly", "annual", "yearly", "renewal"
    ]
    for kw in keywords:
        if kw in desc:
            canonical = kw.title()
            return True, 0.9, canonical
    return False, 0.2, None


@router.post("/api/transactions/classify", response_model=List[ClassifyResp])
def classify_transactions(user_id: int):
    """Classify all transactions for a user and persist results.
    This is a lightweight rules-based classifier meant as a drop-in before LLM integration.
    """
    try:
        conn = sqlite3.connect("subsmart.db")
        cur = conn.cursor()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DB error: {e}")

    # fetch transactions
    cur.execute("SELECT id, description, amount FROM transactions WHERE user_id = ?", (user_id,))
    rows = cur.fetchall()
    if not rows:
        return []

    _ensure_table(cur)
    results = []
    for tid, description, amount in rows:
        is_sub, conf, canonical = classify_transaction(description)
        cur.execute(
            "INSERT OR REPLACE INTO classification_results (transaction_id, user_id, is_subscription, confidence, canonical_merchant, source) VALUES (?, ?, ?, ?, ?, ?)",
            (tid, user_id, int(is_sub), float(conf), canonical, "rules"),
        )
        conn.commit()
        results.append({
            "transaction_id": tid,
            "is_subscription": bool(is_sub),
            "confidence": float(conf),
            "canonical_merchant": canonical,
            "source": "rules",
        })

    conn.close()
    return results
