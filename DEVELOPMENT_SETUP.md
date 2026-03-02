# Development Setup Guide

## 🚀 Running Task Tracker with Flask Backend and React Frontend

This guide explains how to run both the Flask backend and React frontend together for development.

## 📋 Prerequisites

1. **Python 3.7+** installed
2. **Node.js 16+** and **npm** installed
3. **Flask dependencies** installed

## 🛠️ Installation

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Install Frontend Dependencies
```bash
npm install
```

## 🏃‍♂️ Running the Development Environment

### Option 1: Using the Batch Script (Recommended)
```bash
# Run this from the project root directory
start-dev.bat
```

This will:
- 🚀 Start the Flask backend server on port 5000
- 🌐 Start the React frontend server on port 3000
- 📝 Open two separate terminal windows

### Option 2: Manual Setup

#### Terminal 1: Start Backend
```bash
cd backend
python start_backend.py
```

#### Terminal 2: Start Frontend
```bash
npm run frontend
```

### Option 3: Using npm start (if concurrently is installed)
```bash
# First install concurrently
npm install concurrently --save-dev

# Then run
npm start
```

## 🌐 Accessing the Application

Once both servers are running:

- **Frontend (React)**: http://localhost:3000
- **Backend (Flask)**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/health

## 🔧 How It Works

### Proxy Configuration
The webpack dev server is configured to proxy API requests:

```javascript
// webpack.config.js
proxy: {
  "/api": {
    target: "http://localhost:5000",
    changeOrigin: true,
    secure: false,
  },
}
```

This means:
- Frontend requests to `/api/tasks` are automatically forwarded to `http://localhost:5000/api/tasks`
- No CORS issues between frontend and backend
- Seamless development experience

### Backend Startup Script
The `backend/start_backend.py` script:
- Starts the Flask server on port 5000
- Shows helpful information about available endpoints
- Handles graceful shutdown

## 🧪 Testing the Setup

### 1. Verify Backend is Running
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "Task Tracker API is running",
  "timestamp": "03/02/2026, 05:30 PM",
  "total_tasks": 3
}
```

### 2. Verify Frontend is Running
- Open http://localhost:3000 in your browser
- You should see the Task Tracker application

### 3. Test API Integration
- Add a task in the frontend
- Check that it appears in the task list
- Verify the task is saved in the backend

## 📁 Project Structure

```
first_project/
├── backend/
│   ├── app.py              # Flask backend server
│   ├── start_backend.py    # Backend startup script
│   ├── requirements.txt    # Python dependencies
│   └── README.md
├── src/
│   ├── index.js           # React entry point
│   ├── app.js            # Main React component
│   ├── components/       # React components
│   └── styles/          # CSS styles
├── package.json          # Frontend dependencies and scripts
├── webpack.config.js     # Webpack configuration with proxy
├── start-dev.bat         # Development startup script
└── DEVELOPMENT_SETUP.md  # This file
```

## 🐛 Troubleshooting

### Backend Issues
```bash
# Check if Flask is installed
python -c "import flask; print(flask.__version__)"

# Check if backend dependencies are installed
cd backend && pip list | grep -E "(Flask|CORS|swagger)"

# Run backend manually to see errors
cd backend && python app.py
```

### Frontend Issues
```bash
# Check if Node.js and npm are installed
node --version
npm --version

# Check if frontend dependencies are installed
npm list

# Run frontend manually to see errors
npm run frontend
```

### Port Conflicts
If ports 3000 or 5000 are already in use:

#### Change Frontend Port
Edit `webpack.config.js`:
```javascript
devServer: {
  port: 3001, // Change from 3000 to 3001
  // ... rest of config
}
```

#### Change Backend Port
Edit `backend/app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=5001)  # Change from 5000 to 5001
```

Then update the proxy configuration in `webpack.config.js`:
```javascript
proxy: {
  "/api": {
    target: "http://localhost:5001", // Update port
    // ... rest of config
  },
}
```

### CORS Issues
The proxy configuration should handle CORS automatically. If you still have issues:

1. Verify the proxy is configured correctly in `webpack.config.js`
2. Check that the backend is running on the correct port
3. Ensure both servers are running simultaneously

## 🚀 Production Deployment

For production, you would typically:

1. **Build the frontend**:
   ```bash
   npm run build
   ```

2. **Serve the built files** with a web server (nginx, Apache, etc.)

3. **Run the backend** separately:
   ```bash
   cd backend
   python app.py
   ```

4. **Configure your web server** to proxy API requests to the backend

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Webpack Documentation](https://webpack.js.org/)
- [Concurrently Documentation](https://www.npmjs.com/package/concurrently)

## 🎉 Happy Coding!

You now have a complete development environment with:
- ✅ Flask backend running on port 5000
- ✅ React frontend running on port 3000
- ✅ Automatic API proxy configuration
- ✅ Easy startup with `start-dev.bat`
- ✅ Full API documentation available