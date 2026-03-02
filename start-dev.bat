@echo off
echo Starting Task Tracker Development Environment...
echo.

echo 🚀 Starting Flask Backend Server...
start "Backend" cmd /k "cd backend && python start_backend.py"

echo 🌐 Starting React Frontend Server...
start "Frontend" cmd /k "npm run frontend"

echo.
echo Both servers are starting...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press Ctrl+C in each terminal to stop the servers.
echo.
pause