import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '@/models/types';
import { useTheme } from '@/contexts/ThemeContext';
import TaskItem from './TaskItem';
import { getTasksByUserId, completeTask, deleteTask } from '@/services/taskService';
import { useAuth } from '@/contexts/AuthContext';

export default function TaskList() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | 'All'>('All');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const userTasks = await getTasksByUserId(user.id);
      setTasks(userTasks);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (id: number) => {
    try {
      await completeTask(id);
      loadTasks(); // Reload tasks to get the updated list
    } catch (err) {
      console.error('Failed to complete task:', err);
      setError('Failed to complete task. Please try again.');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    // In a real app, you would open a modal or navigate to an edit page
    console.log('Edit task:', task);
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        loadTasks(); // Reload tasks to get the updated list
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };

  const filteredTasks = filter === 'All' 
    ? tasks 
    : tasks.filter((task: Task) => task.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
          theme === 'dark' ? 'border-gray-300' : 'border-gray-900'
        }`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 rounded-md ${
        theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
      }`}>
        <p>{error}</p>
        <button 
          onClick={loadTasks}
          className={`mt-2 px-4 py-2 rounded-md ${
            theme === 'dark' ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'
          }`}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Tasks
        </h2>
        
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value as TaskStatus | 'All')}
            className={`rounded-md border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } px-3 py-2 text-sm`}
          >
            <option value="All">All Tasks</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          
          <button
            onClick={() => console.log('Add new task')}
            className={`px-4 py-2 rounded-md ${
              theme === 'dark' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            Add Task
          </button>
        </div>
      </div>
      
      {filteredTasks.length === 0 ? (
        <div className={`p-8 text-center rounded-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            {filter === 'All' 
              ? 'No tasks found. Create your first task!' 
              : `No ${filter} tasks found.`}
          </p>
        </div>
      ) : (
        <div>
          {filteredTasks.map((task: Task) => (
            <TaskItem
              key={task.id}
              task={task}
              onComplete={handleCompleteTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}
    </div>
  );
} 