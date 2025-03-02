import { Task, TaskInput } from '@/models/types';
import { query, get, run } from '@/database/db';

export async function createTask(taskData: TaskInput): Promise<Task> {
  const result = await run(
    `INSERT INTO Tasks (
      title, description, due_date, priority, status, recurrence, labels, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      taskData.title,
      taskData.description || null,
      taskData.due_date || null,
      taskData.priority || null,
      taskData.status || 'To Do',
      taskData.recurrence || 'None',
      taskData.labels || null,
      taskData.user_id
    ]
  );
  
  const task = await get<Task>(
    'SELECT * FROM Tasks WHERE id = ?',
    [result.lastID]
  );
  
  if (!task) {
    throw new Error('Failed to create task');
  }
  
  return task;
}

export async function getTaskById(id: number): Promise<Task | undefined> {
  return get<Task>(
    'SELECT * FROM Tasks WHERE id = ?',
    [id]
  );
}

export async function getTasksByUserId(userId: number): Promise<Task[]> {
  return query<Task>(
    'SELECT * FROM Tasks WHERE user_id = ? ORDER BY due_date ASC, priority DESC',
    [userId]
  );
}

export async function getTasksByStatus(userId: number, status: Task['status']): Promise<Task[]> {
  return query<Task>(
    'SELECT * FROM Tasks WHERE user_id = ? AND status = ? ORDER BY due_date ASC, priority DESC',
    [userId, status]
  );
}

export async function getTasksByDueDate(userId: number, date: string): Promise<Task[]> {
  // Format date as YYYY-MM-DD for comparison
  const formattedDate = new Date(date).toISOString().split('T')[0];
  
  return query<Task>(
    `SELECT * FROM Tasks 
     WHERE user_id = ? AND date(due_date) = date(?) 
     ORDER BY priority DESC`,
    [userId, formattedDate]
  );
}

export async function getOverdueTasks(userId: number): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  
  return query<Task>(
    `SELECT * FROM Tasks 
     WHERE user_id = ? AND date(due_date) < date(?) AND status != 'Completed' 
     ORDER BY due_date ASC, priority DESC`,
    [userId, today]
  );
}

export async function updateTask(id: number, taskData: Partial<TaskInput>): Promise<Task | undefined> {
  // Build the update query dynamically based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (taskData.title !== undefined) {
    updates.push('title = ?');
    values.push(taskData.title);
  }
  
  if (taskData.description !== undefined) {
    updates.push('description = ?');
    values.push(taskData.description);
  }
  
  if (taskData.due_date !== undefined) {
    updates.push('due_date = ?');
    values.push(taskData.due_date);
  }
  
  if (taskData.priority !== undefined) {
    updates.push('priority = ?');
    values.push(taskData.priority);
  }
  
  if (taskData.status !== undefined) {
    updates.push('status = ?');
    values.push(taskData.status);
  }
  
  if (taskData.recurrence !== undefined) {
    updates.push('recurrence = ?');
    values.push(taskData.recurrence);
  }
  
  if (taskData.labels !== undefined) {
    updates.push('labels = ?');
    values.push(taskData.labels);
  }
  
  if (updates.length === 0) {
    return getTaskById(id);
  }
  
  // Add the task ID to the values array
  values.push(id);
  
  // Execute the update query
  await run(
    `UPDATE Tasks SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
  
  // Return the updated task
  return getTaskById(id);
}

export async function deleteTask(id: number): Promise<boolean> {
  const result = await run(
    'DELETE FROM Tasks WHERE id = ?',
    [id]
  );
  
  return result.changes > 0;
}

export async function completeTask(id: number): Promise<Task | undefined> {
  await run(
    "UPDATE Tasks SET status = 'Completed' WHERE id = ?",
    [id]
  );
  
  const task = await getTaskById(id);
  
  // If the task is recurring, create a new task based on recurrence
  if (task && task.recurrence !== 'None') {
    const dueDate = task.due_date ? new Date(task.due_date) : new Date();
    let newDueDate: Date;
    
    switch (task.recurrence) {
      case 'Daily':
        newDueDate = new Date(dueDate);
        newDueDate.setDate(dueDate.getDate() + 1);
        break;
      case 'Weekly':
        newDueDate = new Date(dueDate);
        newDueDate.setDate(dueDate.getDate() + 7);
        break;
      case 'Monthly':
        newDueDate = new Date(dueDate);
        newDueDate.setMonth(dueDate.getMonth() + 1);
        break;
      default:
        newDueDate = new Date(dueDate);
    }
    
    // Create a new task with the next due date
    await createTask({
      ...task,
      status: 'To Do',
      due_date: newDueDate.toISOString().split('T')[0]
    });
  }
  
  return task;
} 