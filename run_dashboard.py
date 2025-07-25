#!/usr/bin/env python3
"""
Direct launcher for CEO Dashboard
"""

import os
import sys
from pathlib import Path

# Add src to path
base_dir = Path(__file__).parent
sys.path.insert(0, str(base_dir / "src"))

# Import and run the app
if __name__ == "__main__":
    os.chdir(base_dir)
    
    # Import here to ensure path is set
    from app import app
    import uvicorn
    
    # Ensure directories exist
    (base_dir / "static" / "css").mkdir(parents=True, exist_ok=True)
    (base_dir / "static" / "js").mkdir(parents=True, exist_ok=True)
    (base_dir / "templates").mkdir(exist_ok=True)
    
    # Run the server
    uvicorn.run(app, host="0.0.0.0", port=8000)