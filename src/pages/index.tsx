import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Task } from '@/models/types';
import { getTasksByUserId, getOverdueTasks } from '@/services/taskService';
import { getHabitsByUserId } from '@/services/habitService';
import { getRecentNotes } from '@/services/noteService';
import { getDayEvents } from '@/services/calendarService';
import TaskItem from '@/components/tasks/TaskItem';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [habitCount, setHabitCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadDashboardData();
    } else if (!loading) {
      // If not authenticated and not loading, redirect to login
      window.location.href = '/login';
    }
  }, [isAuthenticated, user]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Load overdue tasks
      const overdueTasksData = await getOverdueTasks(user.id);
      setOverdueTasks(overdueTasksData);
      
      // Load today's tasks and events
      const { tasks: todayTasksData } = await getDayEvents(user.id, today);
      setTodayTasks(todayTasksData);
      
      // Get counts for other items
      const habits = await getHabitsByUserId(user.id);
      setHabitCount(habits.length);
      
      const notes = await getRecentNotes(user.id, 5);
      setNoteCount(notes.length);
      
      const { events } = await getDayEvents(user.id, today);
      setEventCount(events.length);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = (id: number) => {
    console.log('Complete task:', id);
    // In a real app, you would call the completeTask service
    // and then reload the dashboard data
  };

  const handleEditTask = (task: Task) => {
    console.log('Edit task:', task);
    // In a real app, you would navigate to the task edit page
    // or open a modal to edit the task
  };

  const handleDeleteTask = (id: number) => {
    console.log('Delete task:', id);
    // In a real app, you would call the deleteTask service
    // and then reload the dashboard data
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login in useEffect
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
            theme === 'dark' ? 'border-gray-300' : 'border-gray-900'
          }`}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4">
        <h1 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        
        {error && (
          <div className={`mb-6 p-4 rounded-md ${
            theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
          }`}>
            <p>{error}</p>
            <button 
              onClick={loadDashboardData}
              className={`mt-2 px-4 py-2 rounded-md ${
                theme === 'dark' ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'
              }`}
            >
              Try Again
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-sm ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Tasks
            </h2>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              }`}>
                {todayTasks.length}
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                for today
              </span>
            </div>
            <a 
              href="/tasks" 
              className={`mt-4 inline-block text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              View all tasks →
            </a>
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Habits
            </h2>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              }`}>
                {habitCount}
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                active habits
              </span>
            </div>
            <a 
              href="/habits" 
              className={`mt-4 inline-block text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              Track habits →
            </a>
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Notes
            </h2>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
              }`}>
                {noteCount}
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                recent notes
              </span>
            </div>
            <a 
              href="/notes" 
              className={`mt-4 inline-block text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              View all notes →
            </a>
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h2 className={`text-lg font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Calendar
            </h2>
            <div className="flex items-center">
              <span className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                {eventCount}
              </span>
              <span className={`ml-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                events today
              </span>
            </div>
            <a 
              href="/calendar" 
              className={`mt-4 inline-block text-sm ${
                theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              View calendar →
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Today's Tasks
            </h2>
            
            {todayTasks.length === 0 ? (
              <div className={`p-6 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No tasks scheduled for today.
                </p>
              </div>
            ) : (
              <div>
                {todayTasks.map(task => (
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
          
          <div>
            <h2 className={`text-xl font-semibold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Overdue Tasks
            </h2>
            
            {overdueTasks.length === 0 ? (
              <div className={`p-6 rounded-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No overdue tasks. Great job!
                </p>
              </div>
            ) : (
              <div>
                {overdueTasks.map(task => (
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
        </div>
      </div>
    </Layout>
  );
} 