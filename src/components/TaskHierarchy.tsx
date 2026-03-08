import * as React from "react";
import { useState, useEffect } from "react";
import '../styles/TaskHierarchy.css';
import NavBar from "./NavBar";
import ConfirmationModal from "./ConfirmationModal";

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

// Status configuration
interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface SubTask {
  id: number;
  text: string;
  description: string;
  status: string;
  isMainTask: boolean;
  createdAt: string;
  lastModified: string;
}

interface MainTask {
  id: number;
  text: string;
  status: string;
  isMainTask: boolean;
  createdAt: string;
  lastModified: string;
  subtasks: SubTask[];
}

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'pending', label: '⏳ Pending', color: '#ffc107' },
  { value: 'in-progress', label: '🔄 In Progress', color: '#0dcaf0' },
  { value: 'done', label: '✅ Done', color: '#198754' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#6c757d' },
  { value: 'blocked', label: '🚧 Blocked', color: '#fd7e14' }
];

const TaskHierarchy: React.FC = () => {
  const [tasks, setTasks] = useState<MainTask[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [subTaskInput, setSubTaskInput] = useState<string>("");
  const [subTaskDescription, setSubTaskDescription] = useState<string>(""); // Add description state
  const [subTaskInputs, setSubTaskInputs] = useState<Record<number, string>>({}); // Individual subtask inputs per main task
  const [subTaskDescriptions, setSubTaskDescriptions] = useState<Record<number, string>>({}); // Individual descriptions per main task
  const [editingSubTask, setEditingSubTask] = useState<number | null>(null); // Track which subtask is being edited
  const [editingText, setEditingText] = useState<string>(""); // Text for editing
  const [editingDescription, setEditingDescription] = useState<string>(""); // Description for editing
  const [selectedMainTask, setSelectedMainTask] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<{ task: MainTask | SubTask; isSubTask: boolean; mainTaskId?: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from cookies on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = (): void => {
    setLoading(true);
    setError(null);
    try {
      const cookieData = getCookie('task_hierarchy_tasks');
      if (cookieData) {
        const decodedData = decodeURIComponent(cookieData);
        const parsedTasks: MainTask[] = JSON.parse(decodedData);
        setTasks(parsedTasks);
      } else {
        // Initialize with sample data if no cookies exist
        const sampleTasks: MainTask[] = [
          {
            id: 1,
            text: "Learn React",
            status: 'in-progress',
            isMainTask: true,
            createdAt: new Date().toLocaleString(),
            lastModified: new Date().toLocaleString(),
            subtasks: [
              {
                id: 101,
                text: "Complete tutorial",
                description: "Follow React official tutorial",
                status: 'pending',
                isMainTask: false,
                createdAt: new Date().toLocaleString(),
                lastModified: new Date().toLocaleString()
              },
              {
                id: 102,
                text: "Build first component",
                description: "Create a simple React component",
                status: 'done',
                isMainTask: false,
                createdAt: new Date().toLocaleString(),
                lastModified: new Date().toLocaleString()
              }
            ]
          },
          {
            id: 2,
            text: "Build a task tracker",
            status: 'done',
            isMainTask: true,
            createdAt: new Date().toLocaleString(),
            lastModified: new Date().toLocaleString(),
            subtasks: [
              {
                id: 201,
                text: "Design UI",
                description: "Create the user interface",
                status: 'done',
                isMainTask: false,
                createdAt: new Date().toLocaleString(),
                lastModified: new Date().toLocaleString()
              }
            ]
          }
        ];
        setTasks(sampleTasks);
        saveTasksToCookies(sampleTasks);
      }
    } catch (err) {
      setError('Failed to load tasks from cookies.');
      setError('Failed to load tasks from cookies.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTasksToCookies = (tasksToSave: MainTask[]): void => {
    try {
      const cookieValue = encodeURIComponent(JSON.stringify(tasksToSave));
      setCookie('task_hierarchy_tasks', cookieValue);
    } catch (err) {
      setError('Failed to save tasks to cookies.');
      console.error('Error saving tasks:', err);
    }
  };

  // Add a new main task
  const addMainTask = (): void => {
    if (inputValue.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const newTask: MainTask = {
          id: Date.now(),
          text: inputValue,
          status: 'pending',
          isMainTask: true,
          createdAt: now.toLocaleString(),
          lastModified: now.toLocaleString(),
          subtasks: []
        };
        
        const updatedTasks = [...tasks, newTask];
        setTasks(updatedTasks);
        saveTasksToCookies(updatedTasks);
        setInputValue("");
      } catch (err) {
        setError('Failed to add main task.');
        setError('Failed to add main task.');
        console.error('Error adding main task:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Add a subtask to a main task
  const addSubTask = (mainTaskId: number): void => {
    const taskInput = subTaskInputs[mainTaskId] || "";
    const taskDescription = subTaskDescriptions[mainTaskId] || "";
    
    if (taskInput.trim() !== "") {
      setLoading(true);
      setError(null);
      try {
        // Find the main task
        const mainTask = tasks.find(task => task.id === mainTaskId);
        if (!mainTask) {
          setError('Main task not found');
          return;
        }

        // Create new subtask with description
        const newSubTask: SubTask = {
          id: Date.now(),
          text: taskInput,
          description: taskDescription, // Add description field
          status: 'pending',
          isMainTask: false,
          createdAt: new Date().toLocaleString(),
          lastModified: new Date().toLocaleString()
        };

        // Update main task with new subtask
        const updatedSubtasks = [...(mainTask.subtasks || []), newSubTask];
        const updatedTask: MainTask = {
          ...mainTask,
          subtasks: updatedSubtasks,
          lastModified: new Date().toLocaleString()
        };


        // Update local state
        const updatedTasks = tasks.map(task => 
          task.id === mainTaskId ? updatedTask : task
        );
        setTasks(updatedTasks);
        saveTasksToCookies(updatedTasks);
        
        // Clear individual inputs for this main task
        setSubTaskInputs({...subTaskInputs, [mainTaskId]: ""});
        setSubTaskDescriptions({...subTaskDescriptions, [mainTaskId]: ""});
        setSelectedMainTask(null);
      } catch (err) {
        setError('Failed to add subtask.');
        setError('Failed to add subtask.');
        console.error('Error adding subtask:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Update main task status
  const updateMainTaskStatus = (taskId: number, newStatus: string): void => {
    setLoading(true);
    setError(null);
    try {
      const task = tasks.find(task => task.id === taskId);
      if (!task) {
        setError('Task not found');
        return;
      }

      const updatedTask: MainTask = {
        ...task,
        status: newStatus,
        lastModified: new Date().toLocaleString()
      };

      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      setTasks(updatedTasks);
      saveTasksToCookies(updatedTasks);
    } catch (err) {
      setError('Failed to update task.');
      setError('Failed to update task.');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update subtask status
  const updateSubTaskStatus = (mainTaskId: number, subTaskId: number, newStatus: string): void => {
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

      const updatedTask: MainTask = {
        ...mainTask,
        subtasks: updatedSubtasks,
        lastModified: new Date().toLocaleString()
      };

      const updatedTasks = tasks.map(task => 
        task.id === mainTaskId ? updatedTask : task
      );
      setTasks(updatedTasks);
      saveTasksToCookies(updatedTasks);
    } catch (err) {
      setError('Failed to update subtask.');
      console.error('Error updating subtask:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a task (main task or subtask)
  const handleDeleteClick = (task: MainTask | SubTask, isSubTask: boolean, mainTaskId?: number): void => {
    setTaskToDelete({ task, isSubTask, mainTaskId });
    setShowModal(true);
  };

  const confirmDelete = (): void => {
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

          const updatedTask: MainTask = {
            ...mainTask,
            subtasks: updatedSubtasks,
            lastModified: new Date().toLocaleString()
          };

          const updatedTasks = tasks.map(task => 
            task.id === taskToDelete.mainTaskId ? updatedTask : task
          );
          setTasks(updatedTasks);
          saveTasksToCookies(updatedTasks);
        } else {
          // Delete main task
          const updatedTasks = tasks.filter(task => task.id !== taskToDelete.task.id);
          setTasks(updatedTasks);
          saveTasksToCookies(updatedTasks);
        }
        
        setShowModal(false);
        setTaskToDelete(null);
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

  // Start editing a subtask
  const startEditSubTask = (subtask: SubTask): void => {
    setEditingSubTask(subtask.id);
    setEditingText(subtask.text);
    setEditingDescription(subtask.description || "");
  };

  // Save edited subtask
  const saveEditSubTask = (mainTaskId: number, subTaskId: number): void => {
    if (editingText.trim() !== "") {
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
            ? { 
                ...subtask, 
                text: editingText,
                description: editingDescription,
                lastModified: new Date().toLocaleString() 
              }
            : subtask
        );

        const updatedTask: MainTask = {
          ...mainTask,
          subtasks: updatedSubtasks,
          lastModified: new Date().toLocaleString()
        };

        const updatedTasks = tasks.map(task => 
          task.id === mainTaskId ? updatedTask : task
        );
        setTasks(updatedTasks);
        saveTasksToCookies(updatedTasks);
        
        // Exit edit mode
        setEditingSubTask(null);
        setEditingText("");
        setEditingDescription("");
      } catch (err) {
        setError('Failed to update subtask.');
        setError('Failed to update subtask.');
        console.error('Error updating subtask:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Cancel editing
  const cancelEditSubTask = (): void => {
    setEditingSubTask(null);
    setEditingText("");
    setEditingDescription("");
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
                        value={subTaskInputs[mainTask.id] || ""}
                        onChange={(e) => setSubTaskInputs({...subTaskInputs, [mainTask.id]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addSubTask(mainTask.id)}
                        placeholder="Enter a subtask..."
                        className="subtask-input"
                        disabled={loading}
                      />
                      <input
                        type="text"
                        value={subTaskDescriptions[mainTask.id] || ""}
                        onChange={(e) => setSubTaskDescriptions({...subTaskDescriptions, [mainTask.id]: e.target.value})}
                        onKeyPress={(e) => e.key === 'Enter' && addSubTask(mainTask.id)}
                        placeholder="Enter description (optional)..."
                        className="subtask-description-input"
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
                            {editingSubTask === subtask.id ? (
                              // Edit Mode
                              <div className="subtask-edit-form">
                                <div className="edit-input-section">
                                  <input
                                    type="text"
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    placeholder="Edit subtask text..."
                                    className="edit-subtask-input"
                                    disabled={loading}
                                  />
                                  <input
                                    type="text"
                                    value={editingDescription}
                                    onChange={(e) => setEditingDescription(e.target.value)}
                                    placeholder="Edit description (optional)..."
                                    className="edit-subtask-description-input"
                                    disabled={loading}
                                  />
                                </div>
                                <div className="edit-actions">
                                  <button
                                    onClick={() => saveEditSubTask(mainTask.id, subtask.id)}
                                    className="save-edit-button"
                                    disabled={loading}
                                  >
                                    {loading ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={cancelEditSubTask}
                                    className="cancel-edit-button"
                                    disabled={loading}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              // View Mode
                              <>
                                <div className="subtask-content">
                                  <span className="subtask-text">{subtask.text}</span>
                                  {subtask.description && (
                                    <span className="subtask-description">{subtask.description}</span>
                                  )}
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
                                    onClick={() => startEditSubTask(subtask)}
                                    className="edit-button"
                                    disabled={loading}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(subtask, true, mainTask.id)}
                                    className="delete-button"
                                    disabled={loading}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
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