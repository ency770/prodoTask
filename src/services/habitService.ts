import { Habit, HabitInput, HabitLog } from '@/models/types';
import { query, get, run, transaction } from '@/database/db';
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function createHabit(habitData: HabitInput): Promise<Habit> {
  const result = await run(
    `INSERT INTO Habits (name, frequency, user_id) 
     VALUES (?, ?, ?)`,
    [
      habitData.name,
      habitData.frequency,
      habitData.user_id
    ]
  );
  
  const habit = await get<Habit>(
    'SELECT * FROM Habits WHERE id = ?',
    [result.lastID]
  );
  
  if (!habit) {
    throw new Error('Failed to create habit');
  }
  
  return habit;
}

export async function getHabitById(id: number): Promise<Habit | undefined> {
  return get<Habit>(
    'SELECT * FROM Habits WHERE id = ?',
    [id]
  );
}

export async function getHabitsByUserId(userId: number): Promise<Habit[]> {
  return query<Habit>(
    'SELECT * FROM Habits WHERE user_id = ? ORDER BY name',
    [userId]
  );
}

export async function updateHabit(id: number, habitData: Partial<HabitInput>): Promise<Habit | undefined> {
  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (habitData.name !== undefined) {
    updates.push('name = ?');
    values.push(habitData.name);
  }
  
  if (habitData.frequency !== undefined) {
    updates.push('frequency = ?');
    values.push(habitData.frequency);
  }
  
  if (updates.length === 0) {
    return getHabitById(id);
  }
  
  // Add the habit ID to the values array
  values.push(id);
  
  // Execute the update query
  await run(
    `UPDATE Habits SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Return the updated habit
  return getHabitById(id);
}

export async function deleteHabit(id: number): Promise<boolean> {
  // First delete all habit logs
  await run(
    'DELETE FROM HabitLogs WHERE habit_id = ?',
    [id]
  );
  
  // Then delete the habit
  const result = await run(
    'DELETE FROM Habits WHERE id = ?',
    [id]
  );
  
  return result.changes > 0;
}

export async function logHabit(habitId: number, date: string = new Date().toISOString().split('T')[0]): Promise<boolean> {
  return transaction(async (db) => {
    // Check if the habit exists
    const habit = await db.get<Habit>(
      'SELECT * FROM Habits WHERE id = ?',
      [habitId]
    );
    
    if (!habit) {
      throw new Error('Habit not found');
    }
    
    // Check if the habit has already been logged for this date
    const existingLog = await db.get<HabitLog>(
      'SELECT * FROM HabitLogs WHERE habit_id = ? AND completed_date = ?',
      [habitId, date]
    );
    
    if (existingLog) {
      // Already logged for this date
      return true;
    }
    
    // Insert the log
    await db.run(
      'INSERT INTO HabitLogs (habit_id, completed_date) VALUES (?, ?)',
      [habitId, date]
    );
    
    // Update the streak and last_logged date
    const lastLoggedDate = habit.last_logged ? new Date(habit.last_logged) : null;
    const currentDate = new Date(date);
    let newStreak = habit.streak;
    
    // If this is the first log or the last log was yesterday, increment the streak
    if (!lastLoggedDate) {
      newStreak = 1;
    } else {
      const dayDifference = Math.floor(
        (currentDate.getTime() - lastLoggedDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (dayDifference === 1) {
        // Consecutive day, increment streak
        newStreak += 1;
      } else if (dayDifference > 1) {
        // Streak broken, reset to 1
        newStreak = 1;
      }
      // If dayDifference is 0 (same day), keep the streak as is
    }
    
    // Update the habit
    await db.run(
      'UPDATE Habits SET streak = ?, last_logged = ? WHERE id = ?',
      [newStreak, date, habitId]
    );
    
    return true;
  });
}

export async function getHabitLogs(habitId: number, startDate: string, endDate: string): Promise<HabitLog[]> {
  return query<HabitLog>(
    `SELECT * FROM HabitLogs 
     WHERE habit_id = ? AND completed_date BETWEEN ? AND ? 
     ORDER BY completed_date`,
    [habitId, startDate, endDate]
  );
}

export async function getHabitLogsForUser(userId: number, date: string): Promise<{ habit: Habit, logged: boolean }[]> {
  const habits = await getHabitsByUserId(userId);
  
  const results = await Promise.all(
    habits.map(async (habit) => {
      const log = await get<HabitLog>(
        'SELECT * FROM HabitLogs WHERE habit_id = ? AND completed_date = ?',
        [habit.id, date]
      );
      
      return {
        habit,
        logged: !!log
      };
    })
  );
  
  return results;
} 