# FastAPI Migration Guide

## 🚀 Converting Flask to FastAPI

This guide explains how to migrate your Flask backend to FastAPI, providing better performance, automatic API documentation, and modern Python features.

## 📋 What Changed

### 1. **Dependencies**
- **Flask** → **FastAPI**
- **Flask-CORS** → **FastAPI CORS middleware**
- **flask-swagger-ui** → **Built-in Swagger UI & ReDoc**

### 2. **Key Improvements**

#### ✅ **Automatic API Documentation**
- **Swagger UI**: Available at `http://localhost:8000/api/docs`
- **ReDoc**: Available at `http://localhost:8000/api/redoc`
- **Interactive API testing** directly in the browser

#### ✅ **Request/Response Validation**
- **Pydantic models** for automatic data validation
- **Type hints** for better IDE support and error detection
- **Automatic error responses** for invalid data

#### ✅ **Performance**
- **Async/await support** for better performance
- **Starlette foundation** (same as ASGI servers)
- **Faster than Flask** for most use cases

#### ✅ **Modern Python Features**
- **Type annotations** throughout
- **Data classes** with Pydantic
- **Better error handling** with HTTPException

## 🛠️ Installation

### 1. Install FastAPI Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the FastAPI Server
```bash
# Option 1: Using the startup script
python run_fastapi.py

# Option 2: Direct uvicorn command
uvicorn app_fastapi:app --host 0.0.0.0 --port 8000 --reload

# Option 3: Using the Python module
python -m uvicorn app_fastapi:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API Endpoints

All endpoints remain the same, but with enhanced features:

### **Health Check**
```http
GET /api/health
```
Returns server status and basic information.

### **Task Management**

#### Get All Tasks
```http
GET /api/tasks
```
Returns all tasks with full validation.

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "text": "Learn FastAPI",
  "status": "pending",
  "is_main_task": true
}
```

#### Get Specific Task
```http
GET /api/tasks/{id}
```

#### Update Task
```http
PUT /api/tasks/{id}
Content-Type: application/json

{
  "status": "in-progress",
  "text": "Updated task text"
}
```

#### Delete Task
```http
DELETE /api/tasks/{id}
```

### **Statistics**
```http
GET /api/tasks/stats
```
Returns task counts by status.

### **Utilities**
```http
DELETE /api/tasks/clear
```
Clears all tasks (for testing).

## 🔧 Code Structure

### **Pydantic Models**
```python
class TaskBase(BaseModel):
    text: str = Field(..., description="Task description")
    status: str = Field(default="pending", regex="^(pending|in-progress|done|cancelled|blocked)$")
    is_main_task: bool = Field(default=True)

class Task(TaskBase):
    id: int
    created_at: str
    last_modified: str
    subtasks: List[Dict[str, Any]] = []
```

### **Route Handlers**
```python
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    return tasks_db

@app.post("/api/tasks", response_model=Task, status_code=201)
async def add_task(task_data: TaskCreate):
    # Automatic validation with Pydantic
    task = create_task(task_data.text, task_data.status)
    tasks_db.append(task)
    return task
```

## 🎯 Key Differences from Flask

### **1. Request Validation**
```python
# Flask (manual validation)
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Task text is required'}), 400

# FastAPI (automatic validation)
@app.post("/api/tasks", response_model=Task, status_code=201)
async def add_task(task_data: TaskCreate):
    # Pydantic automatically validates and converts types
    task = create_task(task_data.text, task_data.status)
    return task
```

### **2. Error Handling**
```python
# Flask (manual error responses)
return jsonify({'error': 'Task not found'}), 404

# FastAPI (automatic error responses)
raise HTTPException(status_code=404, detail="Task not found")
```

### **3. CORS Configuration**
```python
# Flask
CORS(app)

# FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🚀 Running Both Versions

You can run both Flask and FastAPI versions simultaneously:

```bash
# Terminal 1: Flask (port 5000)
cd backend
python app.py

# Terminal 2: FastAPI (port 8000)
cd backend
python run_fastapi.py
```

## 📊 Performance Comparison

| Feature | Flask | FastAPI |
|---------|-------|---------|
| **Request Validation** | Manual | Automatic (Pydantic) |
| **API Documentation** | External (flask-swagger-ui) | Built-in (Swagger UI & ReDoc) |
| **Async Support** | Limited | Full async/await |
| **Performance** | Good | Better (Starlette) |
| **Type Safety** | None | Full type hints |
| **Error Handling** | Manual | Automatic |

## 🔍 Testing the FastAPI Version

### 1. **Start the Server**
```bash
cd backend
python run_fastapi.py
```

### 2. **Visit API Documentation**
- Open your browser
- Go to `http://localhost:8000/api/docs`
- Test all endpoints interactively

### 3. **Test with curl**
```bash
# Health check
curl http://localhost:8000/api/health

# Get all tasks
curl http://localhost:8000/api/tasks

# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Test FastAPI", "status": "pending"}'

# Update a task
curl -X PUT http://localhost:8000/api/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

## 🎉 Benefits of FastAPI

1. **Automatic API Documentation**: No manual Swagger specification needed
2. **Data Validation**: Pydantic ensures data integrity
3. **Type Safety**: Better IDE support and fewer runtime errors
4. **Performance**: Faster than Flask for most use cases
5. **Modern Python**: Uses latest Python features and best practices
6. **Async Support**: Handle more concurrent requests efficiently
7. **Better Error Messages**: Clear, structured error responses

## 🔄 Migration Checklist

- [ ] Install FastAPI dependencies
- [ ] Replace Flask imports with FastAPI
- [ ] Convert route handlers to use Pydantic models
- [ ] Update error handling to use HTTPException
- [ ] Configure CORS middleware
- [ ] Test all endpoints
- [ ] Update frontend API calls if needed
- [ ] Update deployment configuration

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

The FastAPI version provides all the same functionality as Flask but with modern features, better performance, and automatic API documentation!