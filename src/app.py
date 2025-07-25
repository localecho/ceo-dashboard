"""
CEO Dashboard - Main Application
A comprehensive business metrics dashboard for small business owners
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn
import sqlite3
import json
from datetime import datetime, date, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
from services.exporter import DashboardExporter

# Initialize FastAPI app
app = FastAPI(
    title="CEO Dashboard",
    description="One-page business metrics dashboard",
    version="1.0.0"
)

# Setup paths
BASE_DIR = Path(__file__).parent.parent
STATIC_DIR = BASE_DIR / "static"
TEMPLATE_DIR = BASE_DIR / "templates"
DB_PATH = BASE_DIR / "data" / "ceo_dashboard.db"

# Mount static files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Setup templates
templates = Jinja2Templates(directory=str(TEMPLATE_DIR))


# Database connection helper
def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


# API Routes

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/api/metrics")
async def get_metrics():
    """Get all metrics with current values and targets"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get metrics definitions
    cursor.execute("""
        SELECT id, name, category, type, frequency, unit, 
               is_higher_better, decimal_places
        FROM metrics
        ORDER BY category, name
    """)
    metrics = [dict(row) for row in cursor.fetchall()]
    
    # Get current values (latest for each metric)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    
    for metric in metrics:
        # Get latest value
        cursor.execute("""
            SELECT value, date 
            FROM metric_values 
            WHERE metric_id = ? 
            ORDER BY date DESC 
            LIMIT 1
        """, (metric['id'],))
        
        value_row = cursor.fetchone()
        if value_row:
            metric['current_value'] = value_row['value']
            metric['last_updated'] = value_row['date']
        else:
            metric['current_value'] = None
            metric['last_updated'] = None
        
        # Get current target
        cursor.execute("""
            SELECT target_value 
            FROM metric_targets 
            WHERE metric_id = ? 
            AND ? BETWEEN period_start AND period_end
            ORDER BY period_end DESC
            LIMIT 1
        """, (metric['id'], today.isoformat()))
        
        target_row = cursor.fetchone()
        metric['target_value'] = target_row['target_value'] if target_row else None
        
        # Calculate status
        if metric['current_value'] and metric['target_value']:
            completion = metric['current_value'] / metric['target_value']
            if not metric['is_higher_better']:
                completion = 2 - completion
            
            if completion >= 0.9:
                metric['status'] = 'green'
            elif completion >= 0.7:
                metric['status'] = 'yellow'
            else:
                metric['status'] = 'red'
        else:
            metric['status'] = 'gray'
    
    conn.close()
    return metrics


@app.get("/api/dashboard-data")
async def get_dashboard_data():
    """Get complete dashboard data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get metrics with analysis
    metrics = await get_metrics()
    
    # Calculate overall health score
    status_scores = {'green': 100, 'yellow': 70, 'red': 30, 'gray': 50}
    if metrics:
        health_score = sum(status_scores.get(m['status'], 50) for m in metrics) / len(metrics)
    else:
        health_score = 0
    
    # Group metrics by category
    categories = {}
    for metric in metrics:
        cat = metric['category']
        if cat not in categories:
            categories[cat] = {'metrics': [], 'score': 0}
        categories[cat]['metrics'].append(metric)
    
    # Calculate category scores
    for cat, data in categories.items():
        if data['metrics']:
            data['score'] = sum(
                status_scores.get(m['status'], 50) for m in data['metrics']
            ) / len(data['metrics'])
    
    # Identify bottlenecks
    bottlenecks = []
    for metric in metrics:
        if metric['status'] in ['red', 'yellow']:
            score = 100 if metric['status'] == 'red' else 60
            bottlenecks.append({
                'metric_id': metric['id'],
                'metric_name': metric['name'],
                'score': score,
                'status': metric['status']
            })
    bottlenecks.sort(key=lambda x: x['score'], reverse=True)
    
    # Get historical data for trends
    cursor.execute("""
        SELECT metric_id, date, value
        FROM metric_values
        WHERE date >= date('now', '-30 days')
        ORDER BY metric_id, date
    """)
    
    historical = {}
    for row in cursor.fetchall():
        if row['metric_id'] not in historical:
            historical[row['metric_id']] = []
        historical[row['metric_id']].append({
            'date': row['date'],
            'value': row['value']
        })
    
    conn.close()
    
    return {
        'timestamp': datetime.now().isoformat(),
        'health_score': round(health_score, 1),
        'metrics': metrics,
        'categories': categories,
        'bottlenecks': bottlenecks[:3],  # Top 3 bottlenecks
        'historical': historical
    }


@app.post("/api/metrics/{metric_id}/values")
async def add_metric_value(metric_id: str, value: float, notes: Optional[str] = None):
    """Add a new metric value"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    today = date.today()
    week_num = today.isocalendar()[1]
    
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO metric_values 
            (metric_id, value, date, week_number)
            VALUES (?, ?, ?, ?)
        """, (metric_id, value, today.isoformat(), week_num))
        
        conn.commit()
        conn.close()
        
        return {"status": "success", "metric_id": metric_id, "value": value}
    
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/weekly-review/{year}/{week}")
async def get_weekly_review(year: int, week: int):
    """Get data for weekly review"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Calculate week dates
    jan1 = date(year, 1, 1)
    week_start = jan1 + timedelta(days=(week - 1) * 7 - jan1.weekday())
    week_end = week_start + timedelta(days=6)
    
    # Get metrics and values for the week
    cursor.execute("""
        SELECT m.id, m.name, m.category, m.unit,
               v.value as current_week_value,
               t.target_value
        FROM metrics m
        LEFT JOIN metric_values v ON m.id = v.metric_id 
            AND v.date BETWEEN ? AND ?
        LEFT JOIN metric_targets t ON m.id = t.metric_id
            AND ? BETWEEN t.period_start AND t.period_end
        ORDER BY m.category, m.name
    """, (week_start.isoformat(), week_end.isoformat(), week_end.isoformat()))
    
    metrics_data = []
    for row in cursor.fetchall():
        # Get previous week value for comparison
        prev_week_start = week_start - timedelta(days=7)
        prev_week_end = week_end - timedelta(days=7)
        
        cursor.execute("""
            SELECT value FROM metric_values 
            WHERE metric_id = ? AND date BETWEEN ? AND ?
            ORDER BY date DESC LIMIT 1
        """, (row['id'], prev_week_start.isoformat(), prev_week_end.isoformat()))
        
        prev_row = cursor.fetchone()
        prev_value = prev_row['value'] if prev_row else None
        
        metrics_data.append({
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'unit': row['unit'],
            'current_value': row['current_week_value'],
            'previous_value': prev_value,
            'target_value': row['target_value'],
            'needs_input': row['current_week_value'] is None
        })
    
    # Check if review exists
    cursor.execute("""
        SELECT * FROM weekly_reviews 
        WHERE week_number = ? AND year = ?
    """, (week, year))
    
    review = cursor.fetchone()
    
    conn.close()
    
    return {
        'week': week,
        'year': year,
        'start_date': week_start.isoformat(),
        'end_date': week_end.isoformat(),
        'metrics': metrics_data,
        'review': dict(review) if review else None
    }


@app.post("/api/weekly-review/{year}/{week}/complete")
async def complete_weekly_review(
    year: int, 
    week: int,
    primary_bottleneck: str,
    review_notes: str
):
    """Complete a weekly review"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT OR REPLACE INTO weekly_reviews 
            (week_number, year, primary_bottleneck, review_notes, completed_at)
            VALUES (?, ?, ?, ?, ?)
        """, (week, year, primary_bottleneck, review_notes, datetime.now()))
        
        conn.commit()
        conn.close()
        
        return {"status": "success", "message": "Weekly review completed"}
    
    except Exception as e:
        conn.close()
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/metrics/{metric_id}/history")
async def get_metric_history(metric_id: str, days: int = 30):
    """Get historical data for a metric"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    start_date = (date.today() - timedelta(days=days)).isoformat()
    
    cursor.execute("""
        SELECT date, value 
        FROM metric_values 
        WHERE metric_id = ? AND date >= ?
        ORDER BY date
    """, (metric_id, start_date))
    
    history = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return history


# Export endpoints
@app.get("/api/export/csv")
async def export_csv():
    """Export all metrics data as CSV"""
    exporter = DashboardExporter(str(DB_PATH))
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"exports/metrics_export_{timestamp}.csv"
    
    # Ensure exports directory exists
    Path("exports").mkdir(exist_ok=True)
    
    # Export data
    file_path = exporter.export_to_csv(output_path)
    
    return {
        "status": "success",
        "file": file_path,
        "message": "CSV export completed"
    }


@app.get("/api/export/report")
async def export_report():
    """Generate executive report"""
    exporter = DashboardExporter(str(DB_PATH))
    
    # Generate filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_path = f"exports/executive_report_{timestamp}.md"
    
    # Ensure exports directory exists
    Path("exports").mkdir(exist_ok=True)
    
    # Generate report
    file_path = exporter.generate_executive_report(output_path)
    
    return {
        "status": "success",
        "file": file_path,
        "message": "Executive report generated"
    }


@app.get("/api/export/snapshot")
async def export_snapshot():
    """Get current dashboard snapshot as JSON"""
    exporter = DashboardExporter(str(DB_PATH))
    snapshot = exporter.export_dashboard_snapshot()
    
    return snapshot


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# Run the application
if __name__ == "__main__":
    # Ensure database exists
    if not DB_PATH.exists():
        import sys
        sys.path.append(str(BASE_DIR))
        import setup_database
        setup_database.main()
    
    # Ensure directories exist
    STATIC_DIR.mkdir(exist_ok=True)
    TEMPLATE_DIR.mkdir(exist_ok=True)
    
    # Create placeholder files if they don't exist
    if not (STATIC_DIR / "css").exists():
        (STATIC_DIR / "css").mkdir(exist_ok=True)
    if not (STATIC_DIR / "js").exists():
        (STATIC_DIR / "js").mkdir(exist_ok=True)
    
    # Run the server
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)