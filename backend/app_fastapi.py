from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uvicorn

# Create FastAPI app
app = FastAPI(
    title="Task Tracker API",
    description="API for managing tasks with status tracking",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (in production, use a database)
tasks_db = []

def get_next_id():
    """Generate next task ID"""
    if not tasks_db:
        return 1
    return max(task.id for task in tasks_db) + 1

# Pydantic models for request/response validation
class TaskBase(BaseModel):
    text: str = Field(..., description="Task description", example="Learn Python")
    status: str = Field(default="pending", description="Task status", 
                       regex="^(pending|in-progress|done|cancelled|blocked)$")
    is_main_task: bool = Field(default=True, description="Whether this is a main task")

class TaskCreate(TaskBase):
    description: Optional[str] = Field(None, description="Task description")

class TaskUpdate(BaseModel):
    text: Optional[str] = None
    status: Optional[str] = Field(None, regex="^(pending|in-progress|done|cancelled|blocked)$")
    subtasks: Optional[List[Dict[str, Any]]] = None

class Task(TaskBase):
    id: int = Field(..., description="Unique task identifier")
    created_at: str = Field(..., description="Task creation timestamp")
    last_modified: str = Field(..., description="Last modification timestamp")
    subtasks: List[Dict[str, Any]] = Field(default_factory=list, description="Subtasks for main tasks")

    class Config:
        schema_extra = {
            "example": {
                "id": 1,
                "text": "Learn Python",
                "status": "pending",
                "is_main_task": True,
                "created_at": "03/01/2026, 02:00 PM",
                "last_modified": "03/01/2026, 02:00 PM",
                "subtasks": []
            }
        }

def create_task(text: str, status: str = 'pending', is_main_task: bool = True, description: Optional[str] = None):
    """Create a new task"""
    now = datetime.now().strftime("%m/%d/%Y, %I:%M %p")
    task = Task(
        id=get_next_id(),
        text=text,
        status=status,
        is_main_task=is_main_task,
        created_at=now,
        last_modified=now,
        subtasks=[] if is_main_task else None
    )
    
    # Add description if provided
    if description:
        task_dict = task.dict()
        task_dict['description'] = description
        return task_dict
    
    return task.dict()

@app.get("/api/health", response_model=Dict[str, Any])
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'message': 'Task Tracker API is running',
        'timestamp': datetime.now().strftime("%m/%d/%Y, %I:%M %p"),
        'total_tasks': len(tasks_db)
    }

@app.get("/api/tasks", response_model=List[Task])
async def get_tasks():
    """Get all tasks"""
    return tasks_db

@app.post("/api/tasks", response_model=Task, status_code=201)
async def add_task(task_data: TaskCreate):
    """Add a new task"""
    task = create_task(
        text=task_data.text,
        status=task_data.status,
        is_main_task=task_data.is_main_task,
        description=getattr(task_data, 'description', None)
    )
    tasks_db.append(task)
    return task

@app.get("/api/tasks/{task_id}", response_model=Task)
async def get_task(task_id: int):
    """Get a specific task"""
    for task in tasks_db:
        if task['id'] == task_id:
            return task
    
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_data: TaskUpdate):
    """Update task status or subtasks"""
    for task in tasks_db:
        if task['id'] == task_id:
            # Update task properties
            if task_data.text is not None:
                task['text'] = task_data.text
            if task_data.status is not None:
                task['status'] = task_data.status
            if task_data.subtasks is not None:
                task['subtasks'] = task_data.subtasks
            
            task['last_modified'] = datetime.now().strftime("%m/%d/%Y, %I:%M %p")
            return task
    
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    """Delete a task"""
    for i, task in enumerate(tasks_db):
        if task['id'] == task_id:
            tasks_db.pop(i)
            return {"message": "Task deleted successfully"}
    
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/tasks/clear")
async def clear_tasks():
    """Clear all tasks (for testing)"""
    tasks_db.clear()
    return {"message": "All tasks cleared"}

@app.get("/api/tasks/stats", response_model=Dict[str, int])
async def get_stats():
    """Get task statistics"""
    total = len(tasks_db)
    pending = len([t for t in tasks_db if t['status'] == 'pending'])
    in_progress = len([t for t in tasks_db if t['status'] == 'in-progress'])
    done = len([t for t in tasks_db if t['status'] == 'done'])
    cancelled = len([t for t in tasks_db if t['status'] == 'cancelled'])
    blocked = len([t for t in tasks_db if t['status'] == 'blocked'])
    
    return {
        'total': total,
        'pending': pending,
        'in_progress': in_progress,
        'done': done,
        'cancelled': cancelled,
        'blocked': blocked
    }

# Add some sample data for testing when the app starts
@app.on_event("startup")
async def startup_event():
    if not tasks_db:
        tasks_db.append(create_task("Learn React", "in-progress"))
        tasks_db.append(create_task("Build a task tracker", "done"))
        tasks_db.append(create_task("Learn Python backend", "pending"))

if __name__ == "__main__":
    print("Starting Task Tracker Backend with FastAPI...")
    print("API available at: http://localhost:8000")
    print("Health check: http://localhost:8000/api/health")
    print("All tasks: http://localhost:8000/api/tasks")
    print("Swagger UI: http://localhost:8000/api/docs")
    print("ReDoc: http://localhost:8000/api/redoc")
    
    uvicorn.run("app_fastapi:app", host="0.0.0.0", port=8000, reload=True)