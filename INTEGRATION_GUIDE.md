# Task Tracker Backend Integration Guide

This guide shows you how to integrate your React frontend with the Python Flask backend.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd backend
python app.py
```
The backend will run on `http://localhost:5000`

### 2. Use the API Version
Replace your current TaskTracker with the API version:
```jsx
// In src/app.js, replace:
import TaskTracker from './components/TaskTracker';

// With:
import TaskTrackerAPI from './components/TaskTrackerAPI';
```

## 📡 Available Endpoints

### Health Check
- **GET** `http://localhost:5000/api/health`
- Returns server status and task count

### Tasks Management
- **GET** `http://localhost:5000/api/tasks` - Get all tasks
- **POST** `http://localhost:5000/api/tasks` - Add new task
- **PUT** `http://localhost:5000/api/tasks/{id}` - Update task status
- **DELETE** `http://localhost:5000/api/tasks/{id}` - Delete task

### Statistics
- **GET** `http://localhost:5000/api/tasks/stats` - Get task counts by status

## 🔧 API Response Format

```json
{
  "id": 1,
  "text": "Learn Python",
  "status": "pending",
  "createdAt": "03/01/2026, 02:00 PM",
  "lastModified": "03/01/2026, 02:00 PM"
}
```

## 📊 Frontend Integration

### Using the API Service
```javascript
import { taskApi } from './services/api';

// Get all tasks
const tasks = await taskApi.getTasks();

// Add a task
const newTask = await taskApi.addTask({
  text: "New Task",
  status: "pending"
});

// Update task status
const updatedTask = await taskApi.updateTask(taskId, {
  status: "done"
});

// Delete a task
await taskApi.deleteTask(taskId);
```

### Error Handling
The API service includes built-in error handling:
- Network errors
- Server errors (4xx, 5xx)
- Validation errors

## 🗄️ Database Options

### Current: In-Memory Storage
- ✅ Simple setup
- ✅ No database required
- ❌ Data lost on restart

### Production: Database Storage
Replace the in-memory `tasks_db` with:

#### SQLite (Recommended for small apps)
```python
import sqlite3

def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            last_modified TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()
```

#### PostgreSQL (For larger applications)
```python
import psycopg2
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/tasks'
db = SQLAlchemy(app)
```

## 🔒 Security Considerations

### CORS Configuration
The backend includes CORS support for frontend communication:
```python
from flask_cors import CORS
CORS(app)  # Allow all origins (development only)
```

For production, restrict CORS to specific domains:
```python
CORS(app, origins=['https://yourdomain.com'])
```

### Input Validation
The API includes basic validation:
- Task text is required
- Status must be provided for updates
- Task ID must exist

## 🚀 Deployment

### Backend Deployment Options

#### 1. Heroku
```bash
heroku create your-app-name
git push heroku main
heroku ps:scale web=1
```

#### 2. PythonAnywhere
1. Upload your files
2. Set up a virtual environment
3. Install dependencies
4. Configure web app

#### 3. AWS EC2
1. Launch EC2 instance
2. Install Python and dependencies
3. Run the Flask app with Gunicorn
4. Set up Nginx as reverse proxy

### Environment Variables
Create a `.env` file for production:
```bash
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

## 🔄 Migration from Cookies to API

### Step 1: Backup Cookie Data
Export your current cookie data before switching.

### Step 2: Import to API
Use the API to import existing tasks:
```javascript
// Get tasks from cookies
const cookieTasks = JSON.parse(getCookie('tasks') || '[]');

// Import to API
for (const task of cookieTasks) {
  await taskApi.addTask({
    text: task.text,
    status: task.status || 'pending'
  });
}
```

### Step 3: Update Frontend
Replace cookie-based storage with API calls.

## 🧪 Testing the API

### Manual Testing with curl
```bash
# Health check
curl http://localhost:5000/api/health

# Get all tasks
curl http://localhost:5000/api/tasks

# Add a task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Test Task", "status": "pending"}'

# Update task status
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'

# Delete a task
curl -X DELETE http://localhost:5000/api/tasks/1
```

### Automated Testing
Use tools like Postman or write automated tests with pytest:
```python
import pytest
import json

def test_add_task(client):
    response = client.post('/api/tasks', 
        json={'text': 'Test Task', 'status': 'pending'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['text'] == 'Test Task'
```

## 📈 Monitoring and Logging

### Add Logging
```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    logger.info(f"Adding task: {request.json}")
    # ... rest of function
```

### Health Monitoring
The `/api/health` endpoint provides:
- Server status
- Uptime information
- Task count
- Timestamp

## 🎯 Next Steps

1. **Start the backend**: `python backend/app.py`
2. **Test the API**: Use curl or Postman
3. **Integrate frontend**: Use the API version of TaskTracker
4. **Add database**: Replace in-memory storage with SQLite
5. **Deploy**: Choose a hosting option for production

## 🤝 Support

- **Backend Issues**: Check the backend logs
- **Frontend Issues**: Check browser console
- **CORS Issues**: Verify frontend URL matches CORS configuration
- **Database Issues**: Check database connection and permissions