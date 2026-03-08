import * as React from "react";
import { useState, useEffect } from "react";
import '../styles/CookieTaskTracker.css';
import NavBar from "./NavBar";

// Status configuration
interface StatusOption {
  value: string;
  label: string;
  color: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: '⏳ Pending', color: '#ffc107' },
  { value: 'in-progress', label: '🔄 In Progress', color: '#0dcaf0' },
  { value: 'done', label: '✅ Done', color: '#198754' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
  { value: 'blocked', label: '🚧 Blocked', color: '#fd7e14' }
];

interface Task {
  id: number;
  text: string;
  status: string;
  createdAt: string;
  lastModified: string;
}

const CookieTaskTracker: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cookie utility functions
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  const setCookie = (name: string, value: string, days: number = 365): void => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  };

  const deleteCookie = (name: string): void => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  };

  // Load tasks from cookies on component mount
  useEffect(() => {
    loadTasksFromCookies();
  }, []);

  const loadTasksFromCookies = (): void => {
    setLoading(true);
    setError(null);
    try {
      const cookieData = getCookie('task_tracker_tasks');
      if (cookieData) {
        const parsedTasks: Task[] = JSON.parse(decodeURIComponent(cookieData));
        setTasks(parsedTasks);
      } else {
        // Initialize with sample data if no cookies exist
        const sampleTasks: Task[] = [
          {
            id: 1,
            text: "Learn React",
            status: 'in-progress',
            createdAt: new Date().toLocaleString(),
            lastModified: new Date().toLocaleString()
          },
          {
            id: 2,
            text: "Build a task tracker",
            status: 'done',
            createdAt: new Date().toLocaleString(),
            lastModified: new Date().toLocaleString()
          },
          {
            id: 3,
            text: "Learn Python backend",
            status: 'pending',
            createdAt: new Date().toLocaleString(),
            lastModified: new Date().toLocaleString()
          }
        ];
        setTasks(sampleTasks);
        saveTasksToCookies(sampleTasks);
      }
    } catch (err) {
      setError('Failed to load tasks from cookies.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTasksToCookies = (tasksToSave: Task[]): void => {
    try {
      const cookieValue = encodeURIComponent(JSON.stringify(tasksToSave));
      setCookie('task_tracker_tasks', cookieValue);
      setSuccess('Tasks saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save tasks to cookies.');
      console.error('Error saving tasks:', err);
    }
  };

  // Add a new task
  const addTask = (): void => {
    if (inputValue.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        const newTask: Task = {
          id: Date.now(),
          text: inputValue.trim(),
          status: 'pending',
          createdAt: new Date().toLocaleString(),
          lastModified: new Date().toLocaleString()
        };
        
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        setInputValue("");
        saveTasksToCookies(updatedTasks);
      } catch (err) {
        setError('Failed to add task.');
        console.error('Error adding task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update task status
  const updateTaskStatus = (taskId: number, newStatus: string): void => {
    setLoading(true);
    setError(null);
    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: newStatus, lastModified: new Date().toLocaleString() }
          : task
      );
      
      setTasks(updatedTasks);
      saveTasksToCookies(updatedTasks);
    } catch (err) {
      setError('Failed to update task.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task
  const handleDeleteClick = (task: Task): void => {
    setTaskToDelete(task);
    setShowModal(true);
  };

  const confirmDelete = (): void => {
    if (taskToDelete) {
      setLoading(true);
      setError(null);
      try {
        const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
        setTasks(updatedTasks);
        setTaskToDelete(null);
        setShowModal(false);
        saveTasksToCookies(updatedTasks);
      } catch (err) {
        setError('Failed to delete task.');
        console.error('Error deleting task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const cancelDelete = (): void => {
    setShowModal(false);
    setTaskToDelete(null);
  };

  // Clear all tasks
  const clearAllTasks = (): void => {
    setLoading(true);
    setError(null);
    try {
      setTasks([]);
      deleteCookie('task_tracker_tasks');
      setSuccess('All tasks cleared!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to clear tasks.');
      console.error('Error clearing tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  // Export tasks to JSON
  const exportTasks = (): void => {
    try {
      const dataStr = JSON.stringify(tasks, null, 2);
      const dataBlob = new Blob([dataStr], {type: 'application/json'});
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'tasks-export.json';
      link.click();
      URL.revokeObjectURL(url);
      setSuccess('Tasks exported successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to export tasks.');
      console.error('Error exporting tasks:', err);
    }
  };

  // Import tasks from JSON file
  const importTasks = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks: Task[] = JSON.parse(e.target?.result as string);
          setTasks(importedTasks);
          saveTasksToCookies(importedTasks);
          setSuccess('Tasks imported successfully!');
          setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
          setError('Failed to import tasks. Invalid JSON file.');
          console.error('Error importing tasks:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  // Calculate task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const cancelled = tasks.filter(t => t.status === 'cancelled').length;
    const blocked = tasks.filter(t => t.status === 'blocked').length;
    
    return { total, pending, inProgress, done, cancelled, blocked };
  };

  const stats = getTaskStats();

  return (
    <div>
      <NavBar />
      <div className="cookie-task-tracker-container">
        <h1 className="cookie-task-tracker-title">Cookie Task Tracker</h1>
        <p className="cookie-task-tracker-subtitle">Tasks saved locally in your browser cookies</p>
        
        {/* Success Message */}
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-message">
            Loading...
          </div>
        )}
        
        {/* Controls Section */}
        <div className="controls-section">
          <div className="input-section">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="task-input"
              disabled={loading}
            />
            <button onClick={addTask} className="add-task-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </div>
          
          <div className="action-buttons">
            <button onClick={clearAllTasks} className="clear-button" disabled={loading}>
              Clear All
            </button>
            <button onClick={exportTasks} className="export-button" disabled={loading}>
              Export JSON
            </button>
            <label className="import-button">
              Import JSON
              <input
                type="file"
                accept=".json"
                onChange={importTasks}
                style={{ display: 'none' }}
                disabled={loading}
              />
            </label>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <h3>Task Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Tasks</h4>
              <p className="stat-number">{stats.total}</p>
            </div>
            <div className="stat-card pending">
              <h4>Pending</h4>
              <p className="stat-number">{stats.pending}</p>
            </div>
            <div className="stat-card in-progress">
              <h4>In Progress</h4>
              <p className="stat-number">{stats.inProgress}</p>
            </div>
            <div className="stat-card done">
              <h4>Done</h4>
              <p className="stat-number">{stats.done}</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          <h2 className="tasks-subtitle">Your Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="empty-text">
              {loading ? 'Loading tasks...' : 'No tasks yet. Add one above!'}
            </p>
          ) : (
            <div className="tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-card status-${task.status}`}>
                  <div className="task-content">
                    <span className="task-text">{task.text}</span>
                    <div className="task-dates">
                      <span className="date-label">Created:</span>
                      <span className="date-text">{task.createdAt}</span>
                      <span className="date-label">Modified:</span>
                      <span className="date-text">{task.lastModified}</span>
                    </div>
                  </div>
                  <div className="task-actions">
                    <select
                      value={task.status}
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
                    <button
                      onClick={() => handleDeleteClick(task)}
                      className="delete-button"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cookie Info */}
        <div className="cookie-info">
          <h3>Cookie Storage Information</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>✅ Local Storage</h4>
              <p>Tasks are saved in your browser cookies and persist between sessions</p>
            </div>
            <div className="info-card">
              <h4>🔒 Private</h4>
              <p>No data is sent to any server - everything stays on your device</p>
            </div>
            <div className="info-card">
              <h4>🔄 Auto-Save</h4>
              <p>Changes are automatically saved when you add, edit, or delete tasks</p>
            </div>
            <div className="info-card">
              <h4>📁 Export/Import</h4>
              <p>Backup your tasks as JSON files and restore them later</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieTaskTracker;