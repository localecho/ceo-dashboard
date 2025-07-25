"""
Setup database for CEO Dashboard
"""

import sqlite3
import json
from datetime import datetime, date, timedelta

# Database path
DB_PATH = "data/ceo_dashboard.db"

# Create tables
def create_tables(conn):
    """Create all database tables"""
    cursor = conn.cursor()
    
    # Metrics table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metrics (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT NOT NULL,
            type TEXT NOT NULL,
            frequency TEXT NOT NULL,
            unit TEXT,
            is_higher_better INTEGER DEFAULT 1,
            decimal_places INTEGER DEFAULT 0
        )
    """)
    
    # Metric values table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metric_values (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_id TEXT NOT NULL,
            value REAL NOT NULL,
            date DATE NOT NULL,
            week_number INTEGER,
            FOREIGN KEY (metric_id) REFERENCES metrics(id),
            UNIQUE(metric_id, date)
        )
    """)
    
    # Metric targets table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metric_targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_id TEXT NOT NULL,
            target_value REAL NOT NULL,
            period_start DATE NOT NULL,
            period_end DATE NOT NULL,
            FOREIGN KEY (metric_id) REFERENCES metrics(id)
        )
    """)
    
    # Weekly reviews table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS weekly_reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            week_number INTEGER NOT NULL,
            year INTEGER NOT NULL,
            primary_bottleneck TEXT,
            review_notes TEXT,
            completed_at TIMESTAMP,
            UNIQUE(week_number, year)
        )
    """)
    
    conn.commit()

# Load initial metrics
def load_metrics(conn):
    """Load initial metric definitions"""
    cursor = conn.cursor()
    
    # Fixed: Added description field (3rd value) to match the 9 placeholders
    metrics = [
        ("mrr", "Monthly Recurring Revenue", "Total monthly recurring revenue", "Finance", "lagging", "monthly", "$", 1, 2),
        ("cash_flow", "Cash Flow", "Net cash inflow/outflow", "Finance", "lagging", "monthly", "$", 1, 2),
        ("leads_generated", "Leads Generated", "Number of new leads per week", "Sales", "leading", "weekly", "count", 1, 0),
        ("conversion_rate", "Conversion Rate", "Percentage of leads converted", "Sales", "lagging", "weekly", "%", 1, 1),
        ("new_customers", "New Customers", "Number of new customers acquired", "Sales", "lagging", "weekly", "count", 1, 0),
        ("website_traffic", "Website Traffic", "Weekly website visitors", "Marketing", "leading", "weekly", "count", 1, 0),
        ("project_completion", "Project Completion Rate", "Percentage of projects completed on time", "Operations", "lagging", "weekly", "%", 1, 1),
        ("team_productivity", "Team Productivity Score", "Composite score of team output", "Team", "lagging", "weekly", "score", 1, 1),
    ]
    
    for metric in metrics:
        cursor.execute("""
            INSERT OR REPLACE INTO metrics 
            (id, name, description, category, type, frequency, unit, is_higher_better, decimal_places)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, metric)
    
    conn.commit()

# Load sample data
def load_sample_data(conn):
    """Load sample metric values"""
    cursor = conn.cursor()
    today = date.today()
    
    # Sample data for last 4 weeks
    sample_data = {
        "mrr": [45000, 46000, 47500, 48000],
        "cash_flow": [18000, 19000, 17500, 20000],
        "leads_generated": [85, 92, 98, 105],
        "conversion_rate": [12.5, 13.0, 14.2, 15.1],
        "new_customers": [11, 12, 14, 16],
        "website_traffic": [4200, 4600, 4900, 5200],
        "project_completion": [72, 75, 78, 82],
        "team_productivity": [78, 80, 82, 85],
    }
    
    for week_offset in range(3, -1, -1):
        week_date = today - timedelta(weeks=week_offset)
        week_monday = week_date - timedelta(days=week_date.weekday())
        week_num = week_monday.isocalendar()[1]
        
        for metric_id, values in sample_data.items():
            value = values[3 - week_offset]
            cursor.execute("""
                INSERT OR IGNORE INTO metric_values 
                (metric_id, value, date, week_number)
                VALUES (?, ?, ?, ?)
            """, (metric_id, value, week_monday.isoformat(), week_num))
    
    conn.commit()

# Load targets
def load_targets(conn):
    """Load current month targets"""
    cursor = conn.cursor()
    today = date.today()
    month_start = date(today.year, today.month, 1)
    month_end = date(today.year, today.month + 1, 1) - timedelta(days=1) if today.month < 12 else date(today.year, 12, 31)
    
    targets = {
        "mrr": 50000,
        "cash_flow": 20000,
        "leads_generated": 100,
        "conversion_rate": 15,
        "new_customers": 15,
        "website_traffic": 5000,
        "project_completion": 80,
        "team_productivity": 85,
    }
    
    for metric_id, target in targets.items():
        cursor.execute("""
            INSERT OR REPLACE INTO metric_targets 
            (metric_id, target_value, period_start, period_end)
            VALUES (?, ?, ?, ?)
        """, (metric_id, target, month_start.isoformat(), month_end.isoformat()))
    
    conn.commit()

def main():
    """Main setup function"""
    import os
    
    # Create data directory
    os.makedirs("data", exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    
    # Setup database
    create_tables(conn)
    load_metrics(conn)
    load_sample_data(conn)
    load_targets(conn)
    
    # Verify
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM metrics")
    metric_count = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM metric_values")
    value_count = cursor.fetchone()[0]
    
    conn.close()

if __name__ == "__main__":
    main()