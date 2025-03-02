import sqlite3 from 'sqlite3';
// For browser compatibility, handle imports conditionally
import type { Database } from 'sqlite';
// @ts-ignore - Will only be used in Node environment
import * as sqlite from 'sqlite';
// @ts-ignore - Will only be used in Node environment
import fs from 'fs';
// @ts-ignore - Will only be used in Node environment
import path from 'path';

let db: Database | null = null;

// Check if running in browser environment (like Stackblitz)
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

// Mock database for browser environments
class MockDatabase {
  private data: Record<string, any[]> = {
    Users: [],
    Tasks: [],
    Habits: [],
    Notes: [],
    CalendarEvents: [],
    HabitLogs: [],
    Labels: [],
    TaskLabels: []
  };
  
  private lastIds: Record<string, number> = {
    Users: 0,
    Tasks: 0,
    Habits: 0,
    Notes: 0,
    CalendarEvents: 0,
    HabitLogs: 0,
    Labels: 0,
    TaskLabels: 0
  };

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    console.log('Mock DB query:', sql, params);
    
    // Very simple SQL parser for SELECT statements
    if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('from')) {
      const tableMatch = sql.match(/from\s+([a-zA-Z]+)/i);
      if (tableMatch && tableMatch[1]) {
        const tableName = tableMatch[1];
        return this.data[tableName] as T[] || [];
      }
    }
    
    return [];
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    console.log('Mock DB get:', sql, params);
    
    // Very simple SQL parser for SELECT statements with WHERE
    if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('from')) {
      const tableMatch = sql.match(/from\s+([a-zA-Z]+)/i);
      if (tableMatch && tableMatch[1]) {
        const tableName = tableMatch[1];
        const whereMatch = sql.match(/where\s+([a-zA-Z]+)\s*=\s*\?/i);
        
        if (whereMatch && whereMatch[1] && params.length > 0) {
          const fieldName = whereMatch[1].toLowerCase();
          const value = params[0];
          
          return (this.data[tableName] || []).find(item => 
            item[fieldName] == value
          ) as T;
        } else {
          // If no WHERE clause or no params, return the first item
          return (this.data[tableName] || [])[0] as T;
        }
      }
    }
    
    return undefined;
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    console.log('Mock DB run:', sql, params);
    
    // Handle INSERT
    if (sql.toLowerCase().includes('insert into')) {
      const tableMatch = sql.match(/insert into\s+([a-zA-Z]+)/i);
      if (tableMatch && tableMatch[1]) {
        const tableName = tableMatch[1];
        
        // Extract column names
        const columnsMatch = sql.match(/\(([^)]+)\)/);
        const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];
        
        // Create new record
        const newRecord: Record<string, any> = { id: ++this.lastIds[tableName] };
        
        // Add values
        columns.forEach((col, index) => {
          if (params[index] !== undefined) {
            newRecord[col] = params[index];
          }
        });
        
        // Add timestamps if needed
        if (columns.includes('created_at') && !newRecord['created_at']) {
          newRecord['created_at'] = new Date().toISOString();
        }
        
        if (columns.includes('updated_at') && !newRecord['updated_at']) {
          newRecord['updated_at'] = new Date().toISOString();
        }
        
        // Add to data
        if (!this.data[tableName]) {
          this.data[tableName] = [];
        }
        
        this.data[tableName].push(newRecord);
        
        return { lastID: newRecord.id, changes: 1 };
      }
    }
    
    // Handle UPDATE
    if (sql.toLowerCase().includes('update')) {
      const tableMatch = sql.match(/update\s+([a-zA-Z]+)/i);
      if (tableMatch && tableMatch[1]) {
        const tableName = tableMatch[1];
        
        // Extract WHERE condition
        const whereMatch = sql.match(/where\s+([a-zA-Z]+)\s*=\s*\?/i);
        if (whereMatch && whereMatch[1]) {
          const fieldName = whereMatch[1].toLowerCase();
          const value = params[params.length - 1]; // Assuming the WHERE value is the last parameter
          
          // Find the record to update
          const recordIndex = (this.data[tableName] || []).findIndex(item => 
            item[fieldName] == value
          );
          
          if (recordIndex !== -1) {
            // Extract SET part
            const setMatch = sql.match(/set\s+([^where]+)/i);
            if (setMatch && setMatch[1]) {
              const setParts = setMatch[1].split(',').map(p => p.trim());
              
              // Update each field
              setParts.forEach((part, index) => {
                const fieldMatch = part.match(/([a-zA-Z_]+)\s*=\s*\?/);
                if (fieldMatch && fieldMatch[1]) {
                  const field = fieldMatch[1];
                  this.data[tableName][recordIndex][field] = params[index];
                }
              });
              
              // Update timestamp if needed
              if ('updated_at' in this.data[tableName][recordIndex]) {
                this.data[tableName][recordIndex].updated_at = new Date().toISOString();
              }
              
              return { changes: 1 };
            }
          }
        }
      }
    }
    
    // Handle DELETE
    if (sql.toLowerCase().includes('delete from')) {
      const tableMatch = sql.match(/delete from\s+([a-zA-Z]+)/i);
      if (tableMatch && tableMatch[1]) {
        const tableName = tableMatch[1];
        
        // Extract WHERE condition
        const whereMatch = sql.match(/where\s+([a-zA-Z]+)\s*=\s*\?/i);
        if (whereMatch && whereMatch[1] && params.length > 0) {
          const fieldName = whereMatch[1].toLowerCase();
          const value = params[0];
          
          // Find and remove the record
          const initialLength = this.data[tableName]?.length || 0;
          this.data[tableName] = (this.data[tableName] || []).filter(item => 
            item[fieldName] != value
          );
          
          return { changes: initialLength - (this.data[tableName]?.length || 0) };
        }
      }
    }
    
    return { changes: 0 };
  }

  async exec(sql: string): Promise<void> {
    console.log('Mock DB exec:', sql);
    // For schema creation, just log it
    return;
  }

  async close(): Promise<void> {
    console.log('Mock DB closed');
    return;
  }
}

export async function getDb(): Promise<Database | MockDatabase> {
  if (db) return db;
  
  if (isBrowser) {
    console.log('Using mock database for browser environment');
    return new MockDatabase() as any;
  }
  
  // The code below only runs in Node.js environments
  // @ts-ignore - Node.js specific code
  const dataDir = path.join(process.cwd(), 'data');
  // @ts-ignore - Node.js specific code
  if (!fs.existsSync(dataDir)) {
    // @ts-ignore - Node.js specific code
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Open the database
  // @ts-ignore - Node.js specific code
  db = await sqlite.open({
    // @ts-ignore - Node.js specific code
    filename: path.join(dataDir, 'prodotask.db'),
    driver: sqlite3.Database
  });
  
  // Initialize the database with schema
  // @ts-ignore - Node.js specific code
  const schemaPath = path.join(process.cwd(), 'src', 'database', 'schema.sql');
  // @ts-ignore - Node.js specific code
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Execute each statement separately
  const statements = schema
    .split(';')
    .filter((statement: string) => statement.trim())
    .map((statement: string) => statement.trim() + ';');
  
  for (const statement of statements) {
    // @ts-ignore - db is not null here
    await db.exec(statement);
  }
  
  // @ts-ignore - db is not null here
  return db;
}

export async function closeDb(): Promise<void> {
  if (db) {
    await db.close();
    db = null;
  }
}

// Helper functions for common database operations

export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDb();
  return database.all<T>(sql, params);
}

export async function get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  const database = await getDb();
  return database.get<T>(sql, params);
}

export async function run(sql: string, params: any[] = []): Promise<any> {
  const database = await getDb();
  return database.run(sql, params);
}

// Transaction helper
export async function transaction<T>(callback: (db: Database | MockDatabase) => Promise<T>): Promise<T> {
  const database = await getDb();
  
  if (isBrowser) {
    // In browser, just execute the callback without real transactions
    return callback(database);
  }
  
  await (database as Database).exec('BEGIN TRANSACTION');
  
  try {
    const result = await callback(database);
    await (database as Database).exec('COMMIT');
    return result;
  } catch (error) {
    await (database as Database).exec('ROLLBACK');
    throw error;
  }
}