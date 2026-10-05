'use strict';

const express = require('express');
const todos = require('./todo');

const app = express();
app.use(express.json());

/**
 * Stand-in for real session handling. A production deployment would resolve
 * the user from a verified session cookie or bearer token.
 */
function currentUserId(req) {
  const header = req.get('x-user-id');
  return header ? parseInt(header, 10) : null;
}

function requireUser(req, res, next) {
  const userId = currentUserId(req);
  if (!userId) {
    return res.status(401).json({ error: 'authentication required' });
  }
  req.userId = userId;
  next();
}

app.get('/todos', requireUser, (req, res) => {
  res.json(todos.listTodos(req.userId));
});

app.get('/todos/:id', requireUser, (req, res) => {
  const todo = todos.getTodo(req.userId, parseInt(req.params.id, 10));
  if (!todo) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json(todo);
});

app.post('/todos', requireUser, (req, res) => {
  try {
    const todo = todos.createTodo(req.userId, req.body.title, req.body.notes);
    res.status(201).json(todo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/todos/:id', requireUser, (req, res) => {
  const todo = todos.updateTodo(req.userId, parseInt(req.params.id, 10), req.body);
  if (!todo) {
    return res.status(404).json({ error: 'not found' });
  }
  res.json(todo);
});

app.delete('/todos/:id', requireUser, (req, res) => {
  const removed = todos.deleteTodo(req.userId, parseInt(req.params.id, 10));
  if (!removed) {
    return res.status(404).json({ error: 'not found' });
  }
  res.status(204).end();
});

if (require.main === module) {
  app.listen(3000, () => console.log('listening on 3000'));
}

module.exports = app;
