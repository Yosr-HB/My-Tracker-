# Swagger UI Integration Guide

This guide explains how to use the Swagger UI for the Task Tracker API.

## 🚀 Quick Access

### Swagger UI Endpoints
- **Root URL**: `http://localhost:5000/swagger`
- **API Docs URL**: `http://localhost:5000/api/docs`
- **Swagger JSON**: `http://localhost:5000/api/swagger.json`

## 📖 Using Swagger UI

### 1. Access the Interface
Open either of these URLs in your browser:
- `http://localhost:5000/swagger`
- `http://localhost:5000/api/docs`

### 2. Explore API Endpoints
The Swagger UI provides an interactive interface where you can:
- View all available API endpoints
- See detailed documentation for each endpoint
- Test API calls directly from the browser
- View request/response examples

### 3. Test API Endpoints
For each endpoint, you can:
- **View Parameters**: See required and optional parameters
- **Try It Out**: Click "Try it out" to test the endpoint
- **Execute**: Send requests and see real responses
- **View Responses**: See success and error response formats

## 📡 Available Endpoints

### Health Check
- **GET** `/api/health`
- Check if the API is running

### Tasks Management
- **GET** `/api/tasks` - Get all tasks
- **POST** `/api/tasks` - Add new task
- **GET** `/api/tasks/{id}` - Get specific task
- **PUT** `/api/tasks/{id}` - Update task status
- **DELETE** `/api/tasks/{id}` - Delete task

### Statistics
- **GET** `/api/tasks/stats` - Get task statistics
- **DELETE** `/api/tasks/clear` - Clear all tasks

## 🧪 Testing Examples

### Add a New Task
1. Click on `POST /api/tasks`
2. Click "Try it out"
3. Enter JSON in the request body:
```json
{
  "text": "Learn Swagger UI",
  "status": "pending"
}
```
4. Click "Execute"

### Update Task Status
1. Click on `PUT /api/tasks/{id}`
2. Click "Try it out"
3. Enter the task ID in the `id` field
4. Enter JSON in the request body:
```json
{
  "status": "done"
}
```
5. Click "Execute"

## 🔗 Integration with Frontend

### NavBar Integration
The Swagger UI is accessible from the frontend NavBar:
- **Location**: Added "API Docs" link in the navigation menu
- **URL**: Links to `http://localhost:5000/swagger`
- **Target**: Opens in a new tab

### Usage in Development
1. Start the backend: `python backend/app.py`
2. Start the frontend: `npm start`
3. Click "API Docs" in the NavBar
4. Test endpoints while developing

## 📋 API Documentation Features

### Complete Documentation
- **Endpoint Descriptions**: Clear descriptions for each endpoint
- **Parameter Details**: Required/optional parameters with examples
- **Response Schemas**: Detailed response formats
- **Error Responses**: Common error codes and messages

### Interactive Testing
- **Real-time Testing**: Test endpoints with actual data
- **Response Validation**: See if responses match expected schemas
- **Curl Commands**: Generate curl commands for testing
- **Code Examples**: Get example code in different languages

## 🔧 Customization

### Adding New Endpoints
1. Add the endpoint to `backend/app.py`
2. Update the Swagger specification in the `swagger_spec()` function
3. The endpoint will automatically appear in Swagger UI

### Customizing UI
The Swagger UI configuration can be modified in `backend/app.py`:
```python
swaggerui_blueprint = get_swaggerui_blueprint(
    SWAGGER_URL,
    API_URL,
    config={
        'app_name': "Task Tracker API",
        # Add more configuration options here
    }
)
```

## 🚀 Production Deployment

### Considerations
- **Security**: Restrict Swagger UI access in production
- **Documentation**: Keep API documentation up to date
- **Testing**: Use Swagger UI for API testing and validation

### Environment Variables
For production, you might want to:
- Set different host URLs
- Add authentication
- Customize the UI appearance

## 🎯 Benefits

### For Developers
- **API Discovery**: Easily discover available endpoints
- **Interactive Testing**: Test APIs without external tools
- **Documentation**: Always up-to-date API documentation
- **Integration**: Seamless integration with frontend development

### For API Consumers
- **Self-Documentation**: API documentation is always current
- **Testing Interface**: Test endpoints before integration
- **Code Generation**: Generate client code from specifications

## 📚 Additional Resources

- **Swagger UI Documentation**: https://swagger.io/tools/swagger-ui/
- **OpenAPI Specification**: https://swagger.io/specification/
- **Flask-Swagger-UI**: https://github.com/sveint/flask-swagger-ui

## 🤝 Support

If you encounter issues with the Swagger UI:
1. Check if the backend is running
2. Verify the Swagger JSON endpoint: `http://localhost:5000/api/swagger.json`
3. Check browser console for errors
4. Ensure CORS is properly configured