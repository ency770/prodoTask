import { CalendarEvent, CalendarEventInput, Task } from '@/models/types';
import { query, get, run } from '@/database/db';
import { getTasksByDueDate } from './taskService';

export async function createCalendarEvent(eventData: CalendarEventInput): Promise<CalendarEvent> {
  const result = await run(
    `INSERT INTO CalendarEvents (title, start_time, end_time, color, is_all_day, user_id) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      eventData.title,
      eventData.start_time,
      eventData.end_time || null,
      eventData.color || null,
      eventData.is_all_day ? 1 : 0,
      eventData.user_id
    ]
  );
  
  const event = await get<CalendarEvent>(
    'SELECT * FROM CalendarEvents WHERE id = ?',
    [result.lastID]
  );
  
  if (!event) {
    throw new Error('Failed to create calendar event');
  }
  
  return event;
}

export async function getCalendarEventById(id: number): Promise<CalendarEvent | undefined> {
  return get<CalendarEvent>(
    'SELECT * FROM CalendarEvents WHERE id = ?',
    [id]
  );
}

export async function getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
  return query<CalendarEvent>(
    'SELECT * FROM CalendarEvents WHERE user_id = ? ORDER BY start_time',
    [userId]
  );
}

export async function getCalendarEventsByDateRange(
  userId: number, 
  startDate: string, 
  endDate: string
): Promise<CalendarEvent[]> {
  return query<CalendarEvent>(
    `SELECT * FROM CalendarEvents 
     WHERE user_id = ? AND 
     (
       (date(start_time) BETWEEN date(?) AND date(?)) OR
       (date(end_time) BETWEEN date(?) AND date(?)) OR
       (date(start_time) <= date(?) AND date(end_time) >= date(?))
     )
     ORDER BY start_time`,
    [userId, startDate, endDate, startDate, endDate, startDate, endDate]
  );
}

export async function updateCalendarEvent(
  id: number, 
  eventData: Partial<CalendarEventInput>
): Promise<CalendarEvent | undefined> {
  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (eventData.title !== undefined) {
    updates.push('title = ?');
    values.push(eventData.title);
  }
  
  if (eventData.start_time !== undefined) {
    updates.push('start_time = ?');
    values.push(eventData.start_time);
  }
  
  if (eventData.end_time !== undefined) {
    updates.push('end_time = ?');
    values.push(eventData.end_time);
  }
  
  if (eventData.color !== undefined) {
    updates.push('color = ?');
    values.push(eventData.color);
  }
  
  if (eventData.is_all_day !== undefined) {
    updates.push('is_all_day = ?');
    values.push(eventData.is_all_day ? 1 : 0);
  }
  
  if (updates.length === 0) {
    return getCalendarEventById(id);
  }
  
  // Add the event ID to the values array
  values.push(id);
  
  // Execute the update query
  await run(
    `UPDATE CalendarEvents SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Return the updated event
  return getCalendarEventById(id);
}

export async function deleteCalendarEvent(id: number): Promise<boolean> {
  const result = await run(
    'DELETE FROM CalendarEvents WHERE id = ?',
    [id]
  );
  
  return result.changes > 0;
}

// Get all events for a specific day, including tasks with due dates
export async function getDayEvents(
  userId: number, 
  date: string
): Promise<{ events: CalendarEvent[], tasks: Task[] }> {
  const events = await query<CalendarEvent>(
    `SELECT * FROM CalendarEvents 
     WHERE user_id = ? AND 
     (
       date(start_time) = date(?) OR
       date(end_time) = date(?) OR
       (date(start_time) <= date(?) AND date(end_time) >= date(?))
     )
     ORDER BY start_time`,
    [userId, date, date, date, date]
  );
  
  const tasks = await getTasksByDueDate(userId, date);
  
  return { events, tasks };
}

// Check for overlapping events
export async function checkOverlappingEvents(
  userId: number,
  startTime: string,
  endTime: string,
  excludeEventId?: number
): Promise<CalendarEvent[]> {
  let queryStr = `
    SELECT * FROM CalendarEvents 
    WHERE user_id = ? AND is_all_day = 0 AND
    (
      (datetime(start_time) < datetime(?) AND datetime(end_time) > datetime(?)) OR
      (datetime(start_time) >= datetime(?) AND datetime(start_time) < datetime(?)) OR
      (datetime(end_time) > datetime(?) AND datetime(end_time) <= datetime(?))
    )
  `;
  
  const params: any[] = [
    userId, 
    endTime, startTime, 
    startTime, endTime, 
    startTime, endTime
  ];
  
  if (excludeEventId) {
    queryStr += ' AND id != ?';
    params.push(excludeEventId);
  }
  
  return query<CalendarEvent>(queryStr, params);
} 