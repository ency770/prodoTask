import React from 'react';
import { Task, TaskPriority } from '@/models/types';
import { useTheme } from '@/contexts/ThemeContext';
import { format } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskItem({ task, onComplete, onEdit, onDelete }: TaskItemProps) {
  const { theme } = useTheme();
  
  const priorityColors: Record<TaskPriority, { bg: string, text: string }> = {
    'High': {
      bg: theme === 'dark' ? 'bg-red-900' : 'bg-red-100',
      text: theme === 'dark' ? 'text-red-200' : 'text-red-800'
    },
    'Medium': {
      bg: theme === 'dark' ? 'bg-yellow-900' : 'bg-yellow-100',
      text: theme === 'dark' ? 'text-yellow-200' : 'text-yellow-800'
    },
    'Low': {
      bg: theme === 'dark' ? 'bg-blue-900' : 'bg-blue-100',
      text: theme === 'dark' ? 'text-blue-200' : 'text-blue-800'
    }
  };
  
  const statusColors = {
    'To Do': theme === 'dark' ? 'border-gray-600' : 'border-gray-300',
    'In Progress': theme === 'dark' ? 'border-blue-500' : 'border-blue-400',
    'Completed': theme === 'dark' ? 'border-green-500' : 'border-green-400'
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div 
      className={`p-4 mb-3 rounded-lg border-l-4 ${statusColors[task.status]} ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            checked={task.status === 'Completed'}
            onChange={() => onComplete(task.id)}
            className={`h-5 w-5 rounded ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
            } focus:ring-blue-500`}
          />
          
          <div>
            <h3 
              className={`text-base font-medium ${
                task.status === 'Completed' 
                  ? theme === 'dark' ? 'text-gray-400 line-through' : 'text-gray-500 line-through' 
                  : theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            
            {task.description && (
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {task.description}
              </p>
            )}
            
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {task.due_date && (
                <span className={`inline-flex items-center text-xs ${
                  new Date(task.due_date) < new Date() && task.status !== 'Completed'
                    ? theme === 'dark' ? 'text-red-400' : 'text-red-600'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <svg 
                    className="mr-1 h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  {formatDate(task.due_date)}
                </span>
              )}
              
              {task.priority && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  priorityColors[task.priority].bg
                } ${priorityColors[task.priority].text}`}>
                  {task.priority}
                </span>
              )}
              
              {task.recurrence !== 'None' && (
                <span className={`inline-flex items-center text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <svg 
                    className="mr-1 h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  {task.recurrence}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task)}
            className={`p-1 rounded-full ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Edit task"
          >
            <svg 
              className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className={`p-1 rounded-full ${
              theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
            aria-label="Delete task"
          >
            <svg 
              className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 