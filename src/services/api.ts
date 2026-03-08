// API service for connecting to Python FastAPI backend
const API_BASE_URL = 'http://localhost:8000/api';

// Type definitions
export interface Task {
  id: number;
  text: string;
  status: string;
  createdAt: string;
  lastModified: string;
}

export interface TaskData {
  text: string;
  status: string;
}

export interface UpdateData {
  status: string;
}

export interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
  cancelled: number;
  blocked: number;
}

export interface HealthCheck {
  status: string;
  message: string;
}

// API endpoints
export const taskApi = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  },

  // Add a new task
  async addTask(taskData: TaskData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  },

  // Update task status
  async updateTask(id: number, updateData: UpdateData): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  },

  // Delete a task
  async deleteTask(id: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },

  // Get task statistics
  async getStats(): Promise<Stats> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<HealthCheck> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error('API is not healthy');
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Get a specific task
  async getTask(id: number): Promise<Task> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  },

  // Clear all tasks (for testing)
  async clearTasks(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/clear`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear tasks');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing tasks:', error);
      throw error;
    }
  }
};

export default taskApi;