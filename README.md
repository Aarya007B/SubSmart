# SubSmart - Smart Subscription Management

A full-stack fintech application for tracking and managing recurring subscriptions with AI-powered insights.

## 🚀 Features

- **CSV Upload**: Import bank transactions via CSV upload
- **Smart Detection**: AI-powered recurring subscription detection
- **Dashboard**: Comprehensive overview of all subscriptions
- **Insights & Analytics**: Visual charts and spending analytics
- **Proration Calculator**: Calculate refunds for cancelled subscriptions
- **Upcoming Renewals**: Track upcoming billing dates
- **Category Breakdown**: Spending analysis by category

## 📁 Project Structure

```
SubSmart-1/
├── backend/                 # FastAPI backend
│   ├── app.py              # Main application
│   ├── database.py         # Database configuration
│   ├── models/             # SQLAlchemy models
│   ├── routers/            # API endpoints
│   └── utils/              # Utility functions
│
└── frontend/               # Next.js frontend
    ├── app/                # App router pages
    ├── components/         # Reusable components
    └── lib/                # Utilities and API helpers
```

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLAlchemy**: ORM for database operations
- **SQLite**: Lightweight database
- **Pydantic**: Data validation

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS 4**: Utility-first CSS framework
- **Recharts**: Beautiful chart library
- **Lucide Icons**: Modern icon set
- **Axios**: HTTP client

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r ../requirements.txt
```

4. Run the backend server:
```bash
python app.py
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔧 API Endpoints

### Upload
- `POST /api/upload` - Upload CSV file
- `GET /api/transactions` - Get all transactions

### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/{id}` - Get subscription details
- `POST /api/subscriptions/detect` - Detect recurring subscriptions
- `PUT /api/subscriptions/{id}` - Update subscription
- `DELETE /api/subscriptions/{id}` - Delete subscription
- `POST /api/subscriptions/{id}/prorate` - Calculate proration

### Insights
- `GET /api/insights` - Get analytics and insights data

## 📊 CSV Format

Your transaction CSV file should have the following format:

```csv
date,description,amount
2024-01-15,Netflix Subscription,15.99
2024-01-20,Spotify Premium,9.99
2024-02-15,Netflix Subscription,15.99
...
```

**Required columns:**
- `date`: Transaction date (YYYY-MM-DD format)
- `description`: Merchant name or transaction description
- `amount`: Transaction amount (numeric value)

A sample CSV file is included in the root directory as `sample-data.csv`.

## 🎨 Features in Detail

### 1. Upload Page
- Drag-and-drop file upload
- CSV validation
- Multi-step upload process
- Real-time progress tracking

### 2. Dashboard
- Overview statistics
- Monthly and yearly spending
- Active subscription count
- Upcoming renewals section
- All subscriptions grid

### 3. Subscription Details
- Detailed subscription information
- Proration calculator
- Delete functionality
- Status management

### 4. Insights
- Spending trend charts (line graph)
- Category breakdown (pie chart)
- Spending by category (bar chart)
- Highest spend analysis
- Upcoming payments calendar
- Unused subscription detection

## 🏗️ Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Building for Production

#### Backend
```bash
cd backend
# The backend can be deployed on platforms like:
# - Heroku
# - AWS Lambda
# - Google Cloud Run
# - Railway
```

#### Frontend
```bash
cd frontend
npm run build
npm start
```

## 🌐 Deployment

### Backend Deployment (Recommended: Railway/Render)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables
4. Deploy

### Frontend Deployment (Recommended: Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set `NEXT_PUBLIC_API_URL` environment variable
4. Deploy

## 🔒 Environment Variables

### Backend
- No environment variables required for local development
- For production, configure database URL and CORS origins in `app.py`

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Hackathon Project

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI team for the excellent backend framework
- All open-source contributors

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ for smarter subscription management
