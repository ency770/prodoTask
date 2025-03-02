// User model
export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string | null;
  avatar_url: string | null;
  theme_preference: 'light' | 'dark';
  created_at: string;
}

// Task model
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed';
export type TaskRecurrence = 'Daily' | 'Weekly' | 'Monthly' | 'None';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority | null;
  status: TaskStatus;
  recurrence: TaskRecurrence;
  labels: string | null; // Comma-separated list of tags
  created_at: string;
  updated_at: string;
  user_id: number;
}

// Habit model
export type HabitFrequency = 'Daily' | 'Weekly' | 'Monthly';

export interface Habit {
  id: number;
  name: string;
  frequency: HabitFrequency;
  streak: number;
  last_logged: string | null;
  created_at: string;
  user_id: number;
}

// Note model
export interface Note {
  id: number;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: number;
}

// Calendar Event model
export interface CalendarEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string | null;
  color: string | null;
  is_all_day: boolean;
  created_at: string;
  user_id: number;
}

// Habit Log model
export interface HabitLog {
  id: number;
  habit_id: number;
  completed_date: string;
  created_at: string;
}

// Label model
export interface Label {
  id: number;
  name: string;
  color: string | null;
  user_id: number;
}

// Task-Label relationship
export interface TaskLabel {
  task_id: number;
  label_id: number;
}

// Form input types (for creating/updating records)
export type UserInput = Omit<User, 'id' | 'created_at'>;
export type TaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>;
export type HabitInput = Omit<Habit, 'id' | 'streak' | 'last_logged' | 'created_at'>;
export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type CalendarEventInput = Omit<CalendarEvent, 'id' | 'created_at'>;
export type LabelInput = Omit<Label, 'id'>; 