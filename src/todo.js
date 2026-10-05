'use strict';

const db = require('./db');

/**
 * List every todo belonging to a user, newest first.
 */
function listTodos(userId) {
  return db.all(
    'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
}

/**
 * Fetch a single todo by id, scoped to its owner.
 */
function getTodo(userId, id) {
  return db.get('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
}

/**
 * Create a todo. Returns the stored row.
 */
function createTodo(userId, title, notes) {
  if (!title || title.trim() === '') {
    throw new Error('title is required');
  }

  const createdAt = new Date().toISOString();
  const result = db.run(
    'INSERT INTO todos (user_id, title, notes, done, created_at) VALUES (?, ?, ?, 0, ?)',
    [userId, title.trim(), notes || null, createdAt]
  );

  return getTodo(userId, result.lastInsertRowid);
}

/**
 * Apply a partial update. Only title, notes, and done may be changed.
 */
function updateTodo(userId, id, changes) {
  const existing = getTodo(userId, id);
  if (!existing) {
    return null;
  }

  const title = changes.title === undefined ? existing.title : changes.title;
  const notes = changes.notes === undefined ? existing.notes : changes.notes;
  const done = changes.done === undefined ? existing.done : changes.done ? 1 : 0;

  db.run('UPDATE todos SET title = ?, notes = ?, done = ? WHERE id = ? AND user_id = ?', [
    title,
    notes,
    done,
    id,
    userId
  ]);

  return getTodo(userId, id);
}

function deleteTodo(userId, id) {
  const result = db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
  return result.changes > 0;
}

module.exports = { listTodos, getTodo, createTodo, updateTodo, deleteTodo };
