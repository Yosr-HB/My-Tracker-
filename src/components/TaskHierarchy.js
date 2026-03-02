import React, { useState, useEffect } from "react";
import '../styles/TaskHierarchy.css';
import NavBar from "./NavBar";
import ConfirmationModal from "./ConfirmationModal";
import taskApi from "../services/api";

// Status configuration
const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ Pending', color: '#ffc107' },
  { value: 'in-progress', label: '🔄 In Progress', color: '#0dcaf0' },
  { value: 'done', label: '✅ Done', color: '#198754' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
  { value: 'blocked', label: '🚧 Blocked', color: '#fd7e14' }
];

const TaskHierarchy = () => {
  const [tasks, setTasks] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [subTaskInput, setSubTaskInput] = useState("");
  const [selectedMainTask, setSelectedMainTask] = useState(null);
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

  // Add a new main task
  const addMainTask = async () => {
    if (inputValue.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        const newTaskData = {
          text: inputValue,
          status: 'pending',
          isMainTask: true,
          subtasks: []
        };
        
        const newTask = await taskApi.addTask(newTaskData);
        setTasks([...tasks, newTask]);
        setInputValue("");
      } catch (err) {
        setError('Failed to add main task. Please check if the backend is running.');
        console.error('Error adding main task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add a subtask to a main task
  const addSubTask = async (mainTaskId) => {
    if (subTaskInput.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        // Find the main task
        const mainTask = tasks.find(task => task.id === mainTaskId);
        if (!mainTask) {
          setError('Main task not found');
          return;
        }

        // Create new subtask
        const newSubTask = {
          id: Date.now(),
          text: subTaskInput,
          status: 'pending',
          isMainTask: false,
          createdAt: new Date().toLocaleString(),
          lastModified: new Date().toLocaleString()
        };

        // Update main task with new subtask
        const updatedSubtasks = [...(mainTask.subtasks || []), newSubTask];
        const updatedTask = {
          ...mainTask,
          subtasks: updatedSubtasks
        };

        const response = await taskApi.updateTask(mainTaskId, updatedTask);
        
        // Update local state
        setTasks(tasks.map(task => 
          task.id === mainTaskId ? response : task
        ));
        
        setSubTaskInput("");
        setSelectedMainTask(null);
      } catch (err) {
        setError('Failed to add subtask. Please check if the backend is running.');
        console.error('Error adding subtask:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update main task status
  const updateMainTaskStatus = async (taskId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const task = tasks.find(task => task.id === taskId);
      if (!task) {
        setError('Task not found');
        return;
      }

      const updatedTask = {
        ...task,
        status: newStatus,
        lastModified: new Date().toLocaleString()
      };

      const response = await taskApi.updateTask(taskId, updatedTask);
      setTasks(tasks.map(task => 
        task.id === taskId ? response : task
      ));
    } catch (err) {
      setError('Failed to update task. Please check if the backend is running.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update subtask status
  const updateSubTaskStatus = async (mainTaskId, subTaskId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const mainTask = tasks.find(task => task.id === mainTaskId);
      if (!mainTask) {
        setError('Main task not found');
        return;
      }

      const updatedSubtasks = mainTask.subtasks.map(subtask => 
        subtask.id === subTaskId 
          ? { ...subtask, status: newStatus, lastModified: new Date().toLocaleString() }
          : subtask
      );

      const updatedTask = {
        ...mainTask,
        subtasks: updatedSubtasks
      };

      const response = await taskApi.updateTask(mainTaskId, updatedTask);
      setTasks(tasks.map(task => 
        task.id === mainTaskId ? response : task
      ));
    } catch (err) {
      setError('Failed to update subtask. Please check if the backend is running.');
      console.error('Error updating subtask:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task (main task or subtask)
  const handleDeleteClick = (task, isSubTask = false, mainTaskId = null) => {
    setTaskToDelete({ task, isSubTask, mainTaskId });
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete) {
      setLoading(true);
      setError(null);
      try {
        if (taskToDelete.isSubTask) {
          // Delete subtask
          const mainTask = tasks.find(task => task.id === taskToDelete.mainTaskId);
          if (!mainTask) {
            setError('Main task not found');
            return;
          }

          const updatedSubtasks = mainTask.subtasks.filter(subtask => 
            subtask.id !== taskToDelete.task.id
          );

          const updatedTask = {
            ...mainTask,
            subtasks: updatedSubtasks
          };

          const response = await taskApi.updateTask(taskToDelete.mainTaskId, updatedTask);
          setTasks(tasks.map(task => 
            task.id === taskToDelete.mainTaskId ? response : task
          ));
        } else {
          // Delete main task
          await taskApi.deleteTask(taskToDelete.task.id);
          setTasks(tasks.filter(task => task.id !== taskToDelete.task.id));
        }
        
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

  // Calculate task statistics
  const getTaskStats = () => {
    let totalMainTasks = 0;
    let totalSubTasks = 0;
    let pendingMainTasks = 0;
    let pendingSubTasks = 0;
    let inProgressMainTasks = 0;
    let inProgressSubTasks = 0;
    let doneMainTasks = 0;
    let doneSubTasks = 0;

    tasks.forEach(task => {
      if (task.isMainTask) {
        totalMainTasks++;
        switch (task.status) {
          case 'pending': pendingMainTasks++; break;
          case 'in-progress': inProgressMainTasks++; break;
          case 'done': doneMainTasks++; break;
        }
      }
      
      if (task.subtasks) {
        totalSubTasks += task.subtasks.length;
        task.subtasks.forEach(subtask => {
          switch (subtask.status) {
            case 'pending': pendingSubTasks++; break;
            case 'in-progress': inProgressSubTasks++; break;
            case 'done': doneSubTasks++; break;
          }
        });
      }
    });

    return {
      totalMainTasks,
      totalSubTasks,
      pendingMainTasks,
      pendingSubTasks,
      inProgressMainTasks,
      inProgressSubTasks,
      doneMainTasks,
      doneSubTasks
    };
  };

  const stats = getTaskStats();

  return (
    <div>
      <NavBar />
      <div className="task-hierarchy-container">
        <h1 className="task-hierarchy-title">Task Hierarchy Manager</h1>
        
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
        
        {/* Add Main Task Section */}
        <div className="main-task-section">
          <h2>Add Main Task (Theme)</h2>
          <div className="input-section">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMainTask()}
              placeholder="Enter a main task/theme..."
              className="task-input"
              disabled={loading}
            />
            <button onClick={addMainTask} className="add-task-button" disabled={loading}>
              {loading ? 'Adding...' : 'Add Main Task'}
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="stats-section">
          <h3>Task Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Main Tasks</h4>
              <p>Total: {stats.totalMainTasks}</p>
              <p>Pending: {stats.pendingMainTasks}</p>
              <p>In Progress: {stats.inProgressMainTasks}</p>
              <p>Done: {stats.doneMainTasks}</p>
            </div>
            <div className="stat-card">
              <h4>Sub Tasks</h4>
              <p>Total: {stats.totalSubTasks}</p>
              <p>Pending: {stats.pendingSubTasks}</p>
              <p>In Progress: {stats.inProgressSubTasks}</p>
              <p>Done: {stats.doneSubTasks}</p>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        <div className="tasks-container">
          <h2 className="task-hierarchy-subtitle">Your Tasks ({tasks.length} themes)</h2>
          
          {tasks.length === 0 ? (
            <p className="empty-text">
              {loading ? 'Loading tasks...' : 'No tasks yet. Add a main task above!'}
            </p>
          ) : (
            <div className="hierarchy-list">
              {tasks
                .filter(task => task.isMainTask)
                .map((mainTask) => (
                <div key={mainTask.id} className={`main-task-card status-${mainTask.status}`}>
                  <div className="main-task-header">
                    <div className="main-task-content">
                      <span className="main-task-text">{mainTask.text}</span>
                      <span className="main-task-badge">Main Task</span>
                    </div>
                    <div className="main-task-actions">
                      <select
                        value={mainTask.status || 'pending'}
                        onChange={(e) => updateMainTaskStatus(mainTask.id, e.target.value)}
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
                        onClick={() => handleDeleteClick(mainTask, false)}
                        className="delete-button"
                        disabled={loading}
                      >
                        Delete Theme
                      </button>
                    </div>
                  </div>
                  
                  <div className="date-info">
                    <span className="date-label">Created:</span>
                    <span className="date-text">{mainTask.createdAt}</span>
                    <span className="date-label">Modified:</span>
                    <span className="date-text">{mainTask.lastModified}</span>
                  </div>

                  {/* Add Subtask Section */}
                  <div className="subtask-section">
                    <h4>Add Subtask</h4>
                    <div className="input-section">
                      <input
                        type="text"
                        value={subTaskInput}
                        onChange={(e) => setSubTaskInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSubTask(mainTask.id)}
                        placeholder="Enter a subtask..."
                        className="subtask-input"
                        disabled={loading}
                      />
                      <button 
                        onClick={() => addSubTask(mainTask.id)} 
                        className="add-subtask-button"
                        disabled={loading}
                      >
                        Add Subtask
                      </button>
                    </div>
                  </div>

                  {/* Subtasks List */}
                  {mainTask.subtasks && mainTask.subtasks.length > 0 && (
                    <div className="subtasks-list">
                      <h4>Subtasks ({mainTask.subtasks.length})</h4>
                      <ul className="subtask-items">
                        {mainTask.subtasks.map((subtask) => (
                          <li key={subtask.id} className={`subtask-item status-${subtask.status}`}>
                            <div className="subtask-content">
                              <span className="subtask-text">{subtask.text}</span>
                            </div>
                            <div className="subtask-actions">
                              <select
                                value={subtask.status || 'pending'}
                                onChange={(e) => updateSubTaskStatus(mainTask.id, subtask.id, e.target.value)}
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
                                onClick={() => handleDeleteClick(subtask, true, mainTask.id)}
                                className="delete-button"
                                disabled={loading}
                              >
                                Delete
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        taskText={taskToDelete?.task?.text || ""}
      />
    </div>
  );
};

export default TaskHierarchy;