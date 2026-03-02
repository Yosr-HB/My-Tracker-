import React, { useState, useEffect } from "react";
import '../styles/TaskTracker.css';
import NavBar from "./NavBar";
import ConfirmationModal from "./ConfirmationModal";
import taskApi from "../services/api";

// Status configuration - Easy to modify and extend
const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending', color: '#ffc107' },
  { value: 'in-progress', label: '🔄 In Progress', color: '#0dcaf0' },
  { value: 'done', label: '✅ Done', color: '#198754' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
  { value: 'blocked', label: '🚧 Blocked', color: '#fd7e14' }
];

const TaskTrackerAPI = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load tasks from API on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const tasksData = await taskApi.getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError('Failed to load tasks. Please check if the backend is running.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new task
  const addTask = async () => {
    if (inputValue.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        const newTaskData = {
          text: inputValue,
          status: 'pending'
        };
        
        const newTask = await taskApi.addTask(newTaskData);
        setTasks([...tasks, newTask]);
        setInputValue("");
      } catch (err) {
        setError('Failed to add task. Please check if the backend is running.');
        console.error('Error adding task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update task status
  const updateTaskStatus = async (id, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await taskApi.updateTask(id, { status: newStatus });
      setTasks(tasks.map(task => 
        task.id === id ? updatedTask : task
      ));
    } catch (err) {
      setError('Failed to update task. Please check if the backend is running.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      setLoading(true);
      setError(null);
      try {
        await taskApi.deleteTask(taskToDelete.id);
        setTasks(tasks.filter(task => task.id !== taskToDelete.id));
        setShowModal(false);
        setTaskToDelete(null);
      } catch (err) {
        setError('Failed to delete task. Please check if the backend is running.');
        console.error('Error deleting task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelDelete = () => {
    setShowModal(false);
    setTaskToDelete(null);
  };

  return (
    <div>
      <NavBar />
      <div className="task-tracker-container">
        <h1 className="task-tracker-title">Task Tracker (API)</h1>
        
        {/* Error Message */}
        {error && (
          <div style={{ 
            backgroundColor: '#f8d7da', 
            color: '#721c24', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            border: '1px solid #f5c6cb'
          }}>
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ 
            backgroundColor: '#d1ecf1', 
            color: '#0c5460', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            border: '1px solid #bee5eb'
          }}>
            Loading...
          </div>
        )}
        
        {/* Add Task Section */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Enter a new task..."
            className="task-input"
            disabled={loading}
          />
          <button onClick={addTask} className="add-task-button" disabled={loading}>
            {loading ? 'Adding...' : 'Add Task'}
          </button>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          <h2 className="task-tracker-subtitle">Your Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="empty-text">
              {loading ? 'Loading tasks...' : 'No tasks yet. Add one above!'}
            </p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item status-${task.status}`}>
                  <div className="task-content">
                    <span className="task-text">
                      {task.text}
                    </span>
                  </div>
                  <div className="task-actions">
                    <select
                      value={task.status || 'pending'}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="status-selector"
                      disabled={loading}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                    <div className="date-info">
                      <span className="date-label">Created:</span>
                      <span className="date-text">{task.createdAt}</span>
                      <span className="date-label">Modified:</span>
                      <span className="date-text">{task.lastModified}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="delete-button"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        taskText={taskToDelete?.text || ""}
      />
    </div>
  );
};

export default TaskTrackerAPI;