#!/usr/bin/env python3
"""
Backend Startup Script for Flask
This script starts the Flask backend server
"""

import subprocess
import sys
import os

def main():
    print("=" * 60)
    print("Starting Task Tracker Backend with Flask")
    print("=" * 60)
    print("API available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("All tasks: http://localhost:5000/api/tasks")
    print("Swagger UI: http://localhost:5000/api/docs")
    print("=" * 60)
    
    try:
        # Run the Flask application
        subprocess.run([
            sys.executable, "app.py"
        ], cwd=os.path.dirname(os.path.abspath(__file__)))
    except KeyboardInterrupt:
        print("\n🛑 Backend server stopped")
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    main()