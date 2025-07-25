#!/bin/bash

# CEO Dashboard Startup Script

echo "🚀 Starting CEO Dashboard..."

# Change to the dashboard directory
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update requirements
echo "📚 Installing requirements..."
pip install -r requirements.txt --quiet

# Initialize database if it doesn't exist
if [ ! -f "data/ceo_dashboard.db" ]; then
    echo "🗄️ Initializing database..."
    python setup_database.py
fi

# Start the dashboard
echo "✨ Starting dashboard server..."
echo "📊 Dashboard will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Run the application
python src/app.py