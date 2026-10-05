'use strict';

const test = require('node:test');
const assert = require('node:assert');

const db = require('../src/db');
const todos = require('../src/todo');

test.before(() => {
  db.init(':memory:');
});

test('createTodo stores and returns the todo', () => {
  const todo = todos.createTodo(1, 'buy milk', 'semi-skimmed');

  assert.strictEqual(todo.title, 'buy milk');
  assert.strictEqual(todo.notes, 'semi-skimmed');
  assert.strictEqual(todo.done, 0);
  assert.strictEqual(todo.user_id, 1);
});

test('createTodo trims surrounding whitespace', () => {
  const todo = todos.createTodo(1, '   walk the dog   ');
  assert.strictEqual(todo.title, 'walk the dog');
});

test('createTodo rejects an empty title', () => {
  assert.throws(() => todos.createTodo(1, ''), /title is required/);
});

test('listTodos only returns the requesting user rows', () => {
  todos.createTodo(2, 'another user todo');

  const forUserTwo = todos.listTodos(2);
  assert.strictEqual(forUserTwo.length, 1);
  assert.strictEqual(forUserTwo[0].title, 'another user todo');
});

test('updateTodo applies a partial change', () => {
  const created = todos.createTodo(3, 'original');
  const updated = todos.updateTodo(3, created.id, { done: true });

  assert.strictEqual(updated.done, 1);
  assert.strictEqual(updated.title, 'original');
});

test('deleteTodo removes the row', () => {
  const created = todos.createTodo(4, 'temporary');

  assert.strictEqual(todos.deleteTodo(4, created.id), true);
  assert.strictEqual(todos.getTodo(4, created.id), undefined);
});
