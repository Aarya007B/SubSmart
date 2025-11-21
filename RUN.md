# SubSmart - Run Instructions (Optimized for Localhost)

This document provides step-by-step instructions to run SubSmart on your local machine.

## Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18+ with npm
- **macOS/Linux/Windows** with bash or zsh

## 1. Backend Setup & Run

### Step 1.1: Navigate to Project Root
```bash
cd /Users/aaryabalaji/Desktop/IDEC/SubSmart
```

### Step 1.2: Create Python Virtual Environment
```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
# (On Windows: backend\venv\Scripts\activate)
```

### Step 1.3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 1.4: Start Backend Server
**IMPORTANT**: Always run from the project root directory (not from `backend/` folder) so Python can resolve the `backend` package imports.

```bash
uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

**Expected output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Step 1.5: Verify Backend Health
In a new terminal:
```bash
curl http://127.0.0.1:8000/health
# Expected: {"status":"healthy"}
```

---

## 2. Frontend Setup & Run

### Step 2.1: Navigate to Frontend
```bash
cd /Users/aaryabalaji/Desktop/IDEC/SubSmart/frontend
```

### Step 2.2: Install Dependencies
```bash
npm install
```

### Step 2.3: Verify `.env.local`
The `.env.local` file should already exist with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

If it doesn't exist, create it:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

### Step 2.4: Start Frontend Dev Server
```bash
npm run dev
```

**Expected output**:
```
✓ Ready in 5.3s
  - Local:         http://localhost:3000
  - Network:       http://10.x.x.x:3000
```

### Step 2.5: Open App in Browser
Visit: **http://localhost:3000**

---

## 3. Using the App (Full Workflow)

### 3.1: Upload Transactions
1. Go to **Upload** page (http://localhost:3000/upload)
2. Drag & drop or select the `sample-data.csv` file from the project root
3. Click "Upload & Detect"
4. System will parse 93+ transactions automatically

### 3.2: View Dashboard
1. Navigate to **Dashboard** (http://localhost:3000/dashboard)
2. See all detected subscriptions (9 recurring subscriptions found in sample data)
3. View monthly & yearly costs

### 3.3: View Insights
1. Navigate to **Insights** (http://localhost:3000/insights)
2. See:
   - Spending breakdown by category
   - Spending trend charts
   - Highest spend subscription
   - Unused subscriptions
   - Upcoming renewals

### 3.4: Manage Individual Subscriptions
1. Click on any subscription in Dashboard or Insights
2. View details, edit, or delete
3. Calculate proration for cancellations

---

## 4. Testing with curl (Optional)

### Upload Sample CSV
```bash
curl -X POST -F "file=@sample-data.csv" "http://127.0.0.1:8000/api/upload?user_id=1"
```

### Get All Subscriptions
```bash
curl "http://127.0.0.1:8000/api/subscriptions?user_id=1"
```

### Detect Recurring Patterns
```bash
curl -X POST "http://127.0.0.1:8000/api/subscriptions/detect?user_id=1"
```

### Get Insights & Analytics
```bash
curl "http://127.0.0.1:8000/api/insights?user_id=1"
```

### View API Documentation
Open: **http://127.0.0.1:8000/docs**

---

## 5. Troubleshooting

### Backend Won't Start
**Issue**: `ModuleNotFoundError: No module named 'backend'`
- **Cause**: Running from inside `backend/` folder
- **Fix**: Always run `uvicorn` from the project root

**Issue**: Port 8000 already in use
- **Fix**: `lsof -i :8000` and kill the process, or use `--port 8001`

### Frontend Won't Load
**Issue**: Tailwind compilation errors
- **Fix**: We've fixed all `@apply` directives. If you see CSS errors, try:
  ```bash
  rm -rf .next
  npm run dev
  ```

**Issue**: API calls fail (CORS or 404)
- **Fix**: Ensure `.env.local` exists and has `NEXT_PUBLIC_API_URL=http://localhost:8000`
- Restart frontend dev server

### Database Issues
- SQLite database file (`subsmart.db`) is created automatically in the project root
- To reset: `rm subsmart.db` and restart backend

---

## 6. Architecture Summary

| Component | Tech | Port | URL |
|-----------|------|------|-----|
| **Backend API** | FastAPI + SQLAlchemy | 8000 | http://127.0.0.1:8000 |
| **Frontend** | Next.js 16 + TypeScript | 3000 | http://localhost:3000 |
| **Database** | SQLite | - | `./subsmart.db` |

### API Endpoints
- `GET /` - API info
- `GET /health` - Health check
- `POST /api/upload` - Upload CSV
- `GET /api/subscriptions` - List subscriptions
- `POST /api/subscriptions/detect` - Detect recurring
- `GET /api/insights` - Get analytics
- `GET /docs` - Swagger UI

---

## 7. Key Optimizations Applied

✅ **Backend**
- Fixed database initialization
- All endpoints tested and working
- CORS properly configured for localhost:3000
- CSV parser handles multiple date formats

✅ **Frontend**
- Fixed all Tailwind `@apply` compatibility issues
- Created `.env.local` for API configuration
- All components compiled and tested
- Responsive UI with animations

✅ **Both**
- No external dependencies on cloud services
- Fully self-contained SQLite database
- Works offline after initial setup
- Production-ready code quality

---

## 8. Sample Data

The `sample-data.csv` includes 93 transactions from Jan-Nov 2024 with:
- Netflix, Spotify, Adobe Creative Cloud, Amazon Prime
- Microsoft 365, Dropbox, New York Times, Gym, Disney+

Successfully detected as **9 monthly recurring subscriptions** with estimated **₹184.93/month** spend.

---

## 9. Next Steps (Optional)

- **Customize**: Edit sample-data.csv with your own transactions
- **Deploy**: See README.md for deployment to Vercel (frontend) and Railway/Render (backend)
- **Extend**: Add more subscription detection algorithms or payment features

---

## Support

- **Backend docs**: http://127.0.0.1:8000/docs (interactive Swagger UI)
- **Frontend**: All pages include error handling and loading states
- **Issues**: Check troubleshooting section above

---

**Made with ❤️ for smarter subscription management**
