# Task Tracker Backend API

A Python Flask backend API for the Task Tracker application.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## 📡 API Endpoints

### Health Check
- **GET** `/api/health` - Check if the API is running

### Tasks Management
- **GET** `/api/tasks` - Get all tasks
- **POST** `/api/tasks` - Add a new task
- **GET** `/api/tasks/<id>` - Get a specific task
- **PUT** `/api/tasks/<id>` - Update task status
- **DELETE** `/api/tasks/<id>` - Delete a task

### Statistics
- **GET** `/api/tasks/stats` - Get task statistics
- **DELETE** `/api/tasks/clear` - Clear all tasks (testing)

## 🔄 API Examples

### Add a Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Learn Python", "status": "pending"}'
```

### Update Task Status
```bash
curl -X PUT http://localhost:5000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}'
```

### Get All Tasks
```bash
curl http://localhost:5000/api/tasks
```

## 📊 Sample Response

```json
{
  "id": 1,
  "text": "Learn Python",
  "status": "pending",
  "createdAt": "03/01/2026, 02:00 PM",
  "lastModified": "03/01/2026, 02:00 PM"
}
```

## 🛠️ Integration with Frontend

To connect your React frontend to this backend:

1. **Update API URLs** in your frontend to use `http://localhost:5000/api/`
2. **Replace cookie storage** with API calls
3. **Handle CORS** (already configured in the backend)

## 🗄️ Database

Currently using in-memory storage. For production:
- Replace `tasks_db` list with a database (SQLite, PostgreSQL, etc.)
- Add database models and migrations
- Implement proper error handling

## 🔧 Development

- **Debug Mode**: Enabled by default
- **Auto-reload**: Changes to code restart the server
- **CORS**: Enabled for frontend communication