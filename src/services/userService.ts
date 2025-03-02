import { User, UserInput } from '@/models/types';
import { query, get, run } from '@/database/db';
import bcrypt from 'bcryptjs';

// Check if running in browser environment (like Stackblitz)
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Simple hash function for browser environments
async function browserHash(password: string): Promise<string> {
  // Use a simple hash for demo purposes in browser environments
  // In a real app, you'd use the Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Simple compare function for browser environments
async function browserCompare(password: string, hash: string): Promise<boolean> {
  const newHash = await browserHash(password);
  return newHash === hash;
}

export async function createUser(userData: Omit<UserInput, 'password_hash'> & { password: string }): Promise<User> {
  // Hash the password
  const password_hash = isBrowser 
    ? await browserHash(userData.password)
    : await bcrypt.hash(userData.password, 10);
  
  // Insert the user into the database
  const result = await run(
    `INSERT INTO Users (email, password_hash, name, avatar_url, theme_preference) 
     VALUES (?, ?, ?, ?, ?)`,
    [
      userData.email,
      password_hash,
      userData.name || null,
      userData.avatar_url || null,
      userData.theme_preference || 'light'
    ]
  );
  
  // Get the created user
  const user = await get<User>(
    'SELECT * FROM Users WHERE id = ?',
    [result.lastID]
  );
  
  if (!user) {
    throw new Error('Failed to create user');
  }
  
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  return get<User>(
    'SELECT * FROM Users WHERE email = ?',
    [email]
  );
}

export async function getUserById(id: number): Promise<User | undefined> {
  return get<User>(
    'SELECT * FROM Users WHERE id = ?',
    [id]
  );
}

export async function updateUser(id: number, userData: Partial<UserInput>): Promise<User | undefined> {
  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (userData.email !== undefined) {
    updates.push('email = ?');
    values.push(userData.email);
  }
  
  if (userData.password_hash !== undefined) {
    updates.push('password_hash = ?');
    values.push(userData.password_hash);
  } else if ('password' in userData && typeof (userData as any).password === 'string') {
    updates.push('password_hash = ?');
    values.push(isBrowser
      ? await browserHash((userData as any).password)
      : await bcrypt.hash((userData as any).password, 10));
  }
  
  if (userData.name !== undefined) {
    updates.push('name = ?');
    values.push(userData.name);
  }
  
  if (userData.avatar_url !== undefined) {
    updates.push('avatar_url = ?');
    values.push(userData.avatar_url);
  }
  
  if (userData.theme_preference !== undefined) {
    updates.push('theme_preference = ?');
    values.push(userData.theme_preference);
  }
  
  if (updates.length === 0) {
    return getUserById(id);
  }
  
  // Add the user ID to the values array
  values.push(id);
  
  // Execute the update query
  await run(
    `UPDATE Users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Return the updated user
  return getUserById(id);
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await run(
    'DELETE FROM Users WHERE id = ?',
    [id]
  );
  
  return result.changes > 0;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return isBrowser
    ? browserCompare(password, user.password_hash)
    : bcrypt.compare(password, user.password_hash);
}

export async function changePassword(userId: number, newPassword: string): Promise<boolean> {
  const password_hash = isBrowser
    ? await browserHash(newPassword)
    : await bcrypt.hash(newPassword, 10);
  
  const result = await run(
    'UPDATE Users SET password_hash = ? WHERE id = ?',
    [password_hash, userId]
  );
  
  return result.changes > 0;
}