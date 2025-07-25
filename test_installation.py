#!/usr/bin/env python3
"""Test CEO Dashboard installation"""

import sys
import os
import sqlite3
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def main():
    """Run installation test"""
    errors = []
    
    # Test database
    db_path = Path("data/ceo_dashboard.db")
    if not db_path.exists():
        errors.append("Database not found")
    else:
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM metrics")
            metric_count = cursor.fetchone()[0]
            if metric_count == 0:
                errors.append("No metrics loaded")
            conn.close()
        except Exception as e:
            errors.append(f"Database error: {e}")
    
    # Test directories
    required_dirs = ["src", "templates", "static", "data"]
    for dir_name in required_dirs:
        if not os.path.exists(dir_name):
            errors.append(f"Missing directory: {dir_name}")
    
    # Report results
    if errors:
        for error in errors:
            pass  # Errors detected
        return 1
    else:
        return 0

if __name__ == "__main__":
    sys.exit(main())