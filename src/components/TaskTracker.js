import React, { useState, useEffect } from "react";
import '../styles/TaskTracker.css';
import NavBar from "./NavBar";
import ConfirmationModal from "./ConfirmationModal";

// Cookie utility functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const setCookie = (name, value, days = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Status configuration - Easy to modify and extend
const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending', color: '#ffc107' },
  { value: 'in-progress', label: '🔄 In Progress', color: '#0dcaf0' },
  { value: 'done', label: '✅ Done', color: '#198754' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
  { value: 'blocked', label: '🚧 Blocked', color: '#fd7e14' }
];

const TaskTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Load tasks from cookies on component mount
  useEffect(() => {
    const savedTasks = getCookie('tasks');
    if (savedTasks) {
      try {
        const decodedData = decodeURIComponent(savedTasks);
        const parsedTasks = JSON.parse(decodedData);
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error parsing saved tasks:', error);
      }
    }
  }, []);

  // Save tasks to cookies whenever tasks change
  useEffect(() => {
    if (tasks.length > 0) {
      setCookie('tasks', JSON.stringify(tasks));
    } else {
      deleteCookie('tasks');
    }
  }, [tasks]);

  // Add a new task
  const addTask = () => {
    if (inputValue.trim() !== "") {
      const now = new Date();
      const newTask = {
        id: Date.now(),
        text: inputValue,
        status: 'pending', // Default status
        createdAt: now.toLocaleString(),
        lastModified: now.toLocaleString()
      };
      setTasks([...tasks, newTask]);
      setInputValue("");
    }
  };

  // Update task status
  const updateTaskStatus = (id, newStatus) => {
    const now = new Date();
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, status: newStatus, lastModified: now.toLocaleString() } : task
    ));
  };


  // Export tasks to JSON
  const exportTasks = () => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks-export.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export tasks:', err);
    }
  };

  // Import tasks from JSON file
  const importTasks = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target.result);
          setTasks(importedTasks);
        } catch (err) {
          console.error('Failed to import tasks. Invalid JSON file:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  // Delete a task
  const handleDeleteClick = (id) => {
    const task = tasks.find(task => task.id === id);
    setTaskToDelete(task);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(task => task.id !== taskToDelete.id));
      setShowModal(false);
      setTaskToDelete(null);
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
        <h1 className="task-tracker-title">Task Tracker</h1>
        
        {/* Add Task Section */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            placeholder="Enter a new task..."
            className="task-input"
          />
          <button onClick={addTask} className="add-task-button">
            Add Task
          </button>
        </div>

        {/* Export/Import Section */}
        <div className="export-import-section">
          <button onClick={exportTasks} className="export-button">
            Export JSON
          </button>
          <label className="import-button">
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={importTasks}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          <h2 className="task-tracker-subtitle">Your Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="empty-text">No tasks yet. Add one above!</p>
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
                      onClick={() => handleDeleteClick(task.id)}
                      className="delete-button"
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

export default TaskTracker;
