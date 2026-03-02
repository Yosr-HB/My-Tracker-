from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_swagger_ui import get_swaggerui_blueprint
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# In-memory storage (in production, use a database)
tasks_db = []

def get_next_id():
    """Generate next task ID"""
    if not tasks_db:
        return 1
    return max(task['id'] for task in tasks_db) + 1

def create_task(text, status='pending', is_main_task=True):
    """Create a new task"""
    now = datetime.now().strftime("%m/%d/%Y, %I:%M %p")
    task = {
        'id': get_next_id(),
        'text': text,
        'status': status,
        'isMainTask': is_main_task,
        'createdAt': now,
        'lastModified': now
    }
    
    # Add subtasks array for main tasks
    if is_main_task:
        task['subtasks'] = []
    
    return task

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks"""
    return jsonify(tasks_db)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    """Add a new task"""
    data = request.get_json()
    
    if not data or 'text' not in data:
        return jsonify({'error': 'Task text is required'}), 400
    
    task = create_task(data['text'], data.get('status', 'pending'))
    tasks_db.append(task)
    
    return jsonify(task), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update task status or subtasks"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    for task in tasks_db:
        if task['id'] == task_id:
            # Update task properties
            if 'status' in data:
                task['status'] = data['status']
            if 'text' in data:
                task['text'] = data['text']
            if 'subtasks' in data:
                task['subtasks'] = data['subtasks']
            
            task['lastModified'] = datetime.now().strftime("%m/%d/%Y, %I:%M %p")
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    global tasks_db
    task_found = False
    
    for task in tasks_db:
        if task['id'] == task_id:
            tasks_db.remove(task)
            task_found = True
            break
    
    if task_found:
        return jsonify({'message': 'Task deleted successfully'})
    else:
        return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """Get a specific task"""
    for task in tasks_db:
        if task['id'] == task_id:
            return jsonify(task)
    
    return jsonify({'error': 'Task not found'}), 404

@app.route('/api/tasks/clear', methods=['DELETE'])
def clear_tasks():
    """Clear all tasks (for testing)"""
    global tasks_db
    tasks_db.clear()
    return jsonify({'message': 'All tasks cleared'})

@app.route('/api/tasks/stats', methods=['GET'])
def get_stats():
    """Get task statistics"""
    total = len(tasks_db)
    pending = len([t for t in tasks_db if t['status'] == 'pending'])
    in_progress = len([t for t in tasks_db if t['status'] == 'in-progress'])
    done = len([t for t in tasks_db if t['status'] == 'done'])
    cancelled = len([t for t in tasks_db if t['status'] == 'cancelled'])
    blocked = len([t for t in tasks_db if t['status'] == 'blocked'])
    
    return jsonify({
        'total': total,
        'pending': pending,
        'in_progress': in_progress,
        'done': done,
        'cancelled': cancelled,
        'blocked': blocked
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Task Tracker API is running',
        'timestamp': datetime.now().strftime("%m/%d/%Y, %I:%M %p"),
        'total_tasks': len(tasks_db)
    })

# Swagger UI configuration
SWAGGER_URL = '/api/docs'  # URL for exposing Swagger UI (without trailing '/')
ROOT_SWAGGER_URL = '/swagger'  # Root URL for Swagger UI
API_URL = '/api/swagger.json'  # Our API url (can of course be a local resource)

swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Task Tracker API"
    }
)
app.register_blueprint(swaggerui_blueprint, url_prefix=SWAGGER_URL)

# Also register root swagger endpoint with unique name
root_swaggerui_blueprint = get_swaggerui_blueprint(
    ROOT_SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Task Tracker API"
    }
)
app.register_blueprint(root_swaggerui_blueprint, url_prefix=ROOT_SWAGGER_URL, name='root_swagger_ui')

# Swagger JSON specification
@app.route('/api/swagger.json')
def swagger_spec():
    """Serve the Swagger specification"""
    swagger_spec = {
        "swagger": "2.0",
        "info": {
            "title": "Task Tracker API",
            "description": "API for managing tasks with status tracking",
            "version": "1.0.0",
            "contact": {
                "name": "Task Tracker Team",
                "email": "support@example.com"
            }
        },
        "host": "localhost:5000",
        "basePath": "/api",
        "schemes": ["http"],
        "paths": {
            "/health": {
                "get": {
                    "summary": "Health check endpoint",
                    "description": "Check if the API is running and get basic information",
                    "responses": {
                        "200": {
                            "description": "API is healthy",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "status": {"type": "string", "example": "healthy"},
                                    "message": {"type": "string", "example": "Task Tracker API is running"},
                                    "timestamp": {"type": "string", "example": "03/01/2026, 02:00 PM"},
                                    "total_tasks": {"type": "integer", "example": 5}
                                }
                            }
                        }
                    }
                }
            },
            "/tasks": {
                "get": {
                    "summary": "Get all tasks",
                    "description": "Retrieve a list of all tasks",
                    "responses": {
                        "200": {
                            "description": "List of tasks",
                            "schema": {
                                "type": "array",
                                "items": {"$ref": "#/definitions/Task"}
                            }
                        }
                    }
                },
                "post": {
                    "summary": "Add a new task",
                    "description": "Create a new task with the provided data",
                    "parameters": [
                        {
                            "name": "task",
                            "in": "body",
                            "required": True,
                            "schema": {
                                "type": "object",
                                "required": ["text"],
                                "properties": {
                                    "text": {
                                        "type": "string",
                                        "description": "Task description",
                                        "example": "Learn Python"
                                    },
                                    "status": {
                                        "type": "string",
                                        "enum": ["pending", "in-progress", "done", "cancelled", "blocked"],
                                        "default": "pending",
                                        "description": "Task status"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "201": {
                            "description": "Task created successfully",
                            "schema": {"$ref": "#/definitions/Task"}
                        },
                        "400": {
                            "description": "Bad request - missing required fields",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Task text is required"}
                                }
                            }
                        }
                    }
                }
            },
            "/tasks/{id}": {
                "get": {
                    "summary": "Get a specific task",
                    "description": "Retrieve a task by its ID",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": True,
                            "type": "integer",
                            "description": "Task ID",
                            "example": 1
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Task found",
                            "schema": {"$ref": "#/definitions/Task"}
                        },
                        "404": {
                            "description": "Task not found",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Task not found"}
                                }
                            }
                        }
                    }
                },
                "put": {
                    "summary": "Update task status",
                    "description": "Update the status of an existing task",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": True,
                            "type": "integer",
                            "description": "Task ID",
                            "example": 1
                        },
                        {
                            "name": "status",
                            "in": "body",
                            "required": True,
                            "schema": {
                                "type": "object",
                                "required": ["status"],
                                "properties": {
                                    "status": {
                                        "type": "string",
                                        "enum": ["pending", "in-progress", "done", "cancelled", "blocked"],
                                        "description": "New task status"
                                    }
                                }
                            }
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Task updated successfully",
                            "schema": {"$ref": "#/definitions/Task"}
                        },
                        "400": {
                            "description": "Bad request - missing required fields",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Status is required"}
                                }
                            }
                        },
                        "404": {
                            "description": "Task not found",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Task not found"}
                                }
                            }
                        }
                    }
                },
                "delete": {
                    "summary": "Delete a task",
                    "description": "Remove a task by its ID",
                    "parameters": [
                        {
                            "name": "id",
                            "in": "path",
                            "required": True,
                            "type": "integer",
                            "description": "Task ID",
                            "example": 1
                        }
                    ],
                    "responses": {
                        "200": {
                            "description": "Task deleted successfully",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {"type": "string", "example": "Task deleted successfully"}
                                }
                            }
                        },
                        "404": {
                            "description": "Task not found",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "error": {"type": "string", "example": "Task not found"}
                                }
                            }
                        }
                    }
                }
            },
            "/tasks/stats": {
                "get": {
                    "summary": "Get task statistics",
                    "description": "Get statistics about tasks grouped by status",
                    "responses": {
                        "200": {
                            "description": "Statistics retrieved successfully",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "total": {"type": "integer", "example": 10},
                                    "pending": {"type": "integer", "example": 5},
                                    "in_progress": {"type": "integer", "example": 3},
                                    "done": {"type": "integer", "example": 2},
                                    "cancelled": {"type": "integer", "example": 0},
                                    "blocked": {"type": "integer", "example": 0}
                                }
                            }
                        }
                    }
                }
            },
            "/tasks/clear": {
                "delete": {
                    "summary": "Clear all tasks",
                    "description": "Remove all tasks (for testing purposes)",
                    "responses": {
                        "200": {
                            "description": "All tasks cleared",
                            "schema": {
                                "type": "object",
                                "properties": {
                                    "message": {"type": "string", "example": "All tasks cleared"}
                                }
                            }
                        }
                    }
                }
            }
        },
        "definitions": {
            "Task": {
                "type": "object",
                "properties": {
                    "id": {
                        "type": "integer",
                        "description": "Unique task identifier",
                        "example": 1
                    },
                    "text": {
                        "type": "string",
                        "description": "Task description",
                        "example": "Learn Python"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["pending", "in-progress", "done", "cancelled", "blocked"],
                        "description": "Current task status",
                        "example": "pending"
                    },
                    "createdAt": {
                        "type": "string",
                        "description": "Task creation timestamp",
                        "example": "03/01/2026, 02:00 PM"
                    },
                    "lastModified": {
                        "type": "string",
                        "description": "Last modification timestamp",
                        "example": "03/01/2026, 02:00 PM"
                    }
                },
                "required": ["id", "text", "status", "createdAt", "lastModified"]
            }
        }
    }
    return jsonify(swagger_spec)

if __name__ == '__main__':
    # Add some sample data for testing
    if not tasks_db:
        tasks_db.append(create_task("Learn React", "in-progress"))
        tasks_db.append(create_task("Build a task tracker", "done"))
        tasks_db.append(create_task("Learn Python backend", "pending"))
    
    print("Starting Task Tracker Backend...")
    print("API available at: http://localhost:5000")
    print("Health check: http://localhost:5000/api/health")
    print("All tasks: http://localhost:5000/api/tasks")
    print("Swagger UI: http://localhost:5000/api/docs")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
