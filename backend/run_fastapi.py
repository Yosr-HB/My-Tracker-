#!/usr/bin/env python3
"""
FastAPI Server Startup Script
Run this script to start the FastAPI server
"""

import uvicorn
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Starting Task Tracker Backend with FastAPI")
    print("=" * 60)
    print("📍 API available at: http://localhost:8000")
    print("🏥 Health check: http://localhost:8000/api/health")
    print("📋 All tasks: http://localhost:8000/api/tasks")
    print("📖 Swagger UI: http://localhost:8000/api/docs")
    print("📚 ReDoc: http://localhost:8000/api/redoc")
    print("=" * 60)
    
    # Run the FastAPI application
    uvicorn.run(
        "app_fastapi:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )