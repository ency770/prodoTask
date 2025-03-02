import { Note, NoteInput } from '@/models/types';
import { query, get, run } from '@/database/db';

export async function createNote(noteData: NoteInput): Promise<Note> {
  const result = await run(
    `INSERT INTO Notes (title, content, user_id) 
     VALUES (?, ?, ?)`,
    [
      noteData.title,
      noteData.content || null,
      noteData.user_id
    ]
  );
  
  const note = await get<Note>(
    'SELECT * FROM Notes WHERE id = ?',
    [result.lastID]
  );
  
  if (!note) {
    throw new Error('Failed to create note');
  }
  
  return note;
}

export async function getNoteById(id: number): Promise<Note | undefined> {
  return get<Note>(
    'SELECT * FROM Notes WHERE id = ?',
    [id]
  );
}

export async function getNotesByUserId(userId: number): Promise<Note[]> {
  return query<Note>(
    'SELECT * FROM Notes WHERE user_id = ? ORDER BY updated_at DESC',
    [userId]
  );
}

export async function searchNotes(userId: number, searchTerm: string): Promise<Note[]> {
  return query<Note>(
    `SELECT * FROM Notes 
     WHERE user_id = ? AND (title LIKE ? OR content LIKE ?) 
     ORDER BY updated_at DESC`,
    [userId, `%${searchTerm}%`, `%${searchTerm}%`]
  );
}

export async function updateNote(id: number, noteData: Partial<NoteInput>): Promise<Note | undefined> {
  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (noteData.title !== undefined) {
    updates.push('title = ?');
    values.push(noteData.title);
  }
  
  if (noteData.content !== undefined) {
    updates.push('content = ?');
    values.push(noteData.content);
  }
  
  if (updates.length === 0) {
    return getNoteById(id);
  }
  
  // Add the note ID to the values array
  values.push(id);
  
  // Execute the update query
  await run(
    `UPDATE Notes SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Return the updated note
  return getNoteById(id);
}

export async function deleteNote(id: number): Promise<boolean> {
  const result = await run(
    'DELETE FROM Notes WHERE id = ?',
    [id]
  );
  
  return result.changes > 0;
}

export async function getRecentNotes(userId: number, limit: number = 5): Promise<Note[]> {
  return query<Note>(
    `SELECT * FROM Notes 
     WHERE user_id = ? 
     ORDER BY updated_at DESC 
     LIMIT ?`,
    [userId, limit]
  );
} 