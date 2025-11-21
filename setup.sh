#!/bin/bash

# SubSmart Local Setup & Run Script
# This script automates the setup and startup of SubSmart on localhost

set -e

PROJECT_ROOT="/Users/aaryabalaji/Desktop/IDEC/SubSmart"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "🚀 SubSmart - Local Setup & Run"
echo "================================"
echo ""

# Check prerequisites
echo "✓ Checking prerequisites..."
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ Node.js/npm required"; exit 1; }
echo "✓ Python and npm found"
echo ""

# Backend Setup
echo "📦 Backend Setup"
echo "---------------"
cd "$PROJECT_ROOT"

if [ ! -d "$BACKEND_DIR/venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv "$BACKEND_DIR/venv"
fi

echo "Activating virtual environment..."
source "$BACKEND_DIR/venv/bin/activate"

echo "Installing backend dependencies..."
pip install -q -r "$PROJECT_ROOT/requirements.txt"
echo "✓ Backend dependencies installed"
echo ""

# Frontend Setup
echo "🎨 Frontend Setup"
echo "----------------"
cd "$FRONTEND_DIR"

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install --silent
    echo "✓ Frontend dependencies installed"
else
    echo "✓ Frontend dependencies already installed"
fi

if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi
echo "✓ Environment configured"
echo ""

# Ready to run
echo "✅ Setup Complete!"
echo ""
echo "🎯 To run SubSmart:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd $PROJECT_ROOT"
echo "  source $BACKEND_DIR/venv/bin/activate"
echo "  uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd $FRONTEND_DIR"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "📚 For detailed instructions, see RUN.md"
echo ""
