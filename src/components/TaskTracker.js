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
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

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
        const parsedTasks = JSON.parse(savedTasks);
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
      const newTask = {
        id: Date.now(),
        text: inputValue,
        status: 'pending', // Default status
        createdAt: new Date().toLocaleString()
      };
      setTasks([...tasks, newTask]);
      setInputValue("");
    }
  };

  // Toggle task completion
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
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

        {/* Tasks List */}
        <div className="tasks-container">
          <h2 className="task-tracker-subtitle">Your Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <p className="empty-text">No tasks yet. Add one above!</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-content">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="task-checkbox"
                    />
                    <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                      {task.text}
                    </span>
                  </div>
                  <div className="task-info">
                    <span className="date-text">{task.createdAt}</span>
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
