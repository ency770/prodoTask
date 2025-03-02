-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT,
    avatar_url TEXT,
    theme_preference TEXT DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS Tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    priority TEXT CHECK(priority IN ('High', 'Medium', 'Low')),
    status TEXT CHECK(status IN ('To Do', 'In Progress', 'Completed')) DEFAULT 'To Do',
    recurrence TEXT CHECK(recurrence IN ('Daily', 'Weekly', 'Monthly', 'None')) DEFAULT 'None',
    labels TEXT, -- Comma-separated list of tags
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Habits Table
CREATE TABLE IF NOT EXISTS Habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    frequency TEXT CHECK(frequency IN ('Daily', 'Weekly', 'Monthly')),
    streak INTEGER DEFAULT 0,
    last_logged DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Notes Table
CREATE TABLE IF NOT EXISTS Notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Calendar Events Table
CREATE TABLE IF NOT EXISTS CalendarEvents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    color TEXT,
    is_all_day BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

-- Habit Logs Table (for tracking daily habit completion)
CREATE TABLE IF NOT EXISTS HabitLogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    completed_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(habit_id) REFERENCES Habits(id),
    UNIQUE(habit_id, completed_date)
);

-- Task Labels Table (for better organization of labels)
CREATE TABLE IF NOT EXISTS Labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES Users(id),
    UNIQUE(name, user_id)
);

-- Task-Label relationship (many-to-many)
CREATE TABLE IF NOT EXISTS TaskLabels (
    task_id INTEGER,
    label_id INTEGER,
    PRIMARY KEY(task_id, label_id),
    FOREIGN KEY(task_id) REFERENCES Tasks(id),
    FOREIGN KEY(label_id) REFERENCES Labels(id)
);

-- Triggers to update the updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_task_timestamp 
AFTER UPDATE ON Tasks
BEGIN
    UPDATE Tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_note_timestamp 
AFTER UPDATE ON Notes
BEGIN
    UPDATE Notes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END; 