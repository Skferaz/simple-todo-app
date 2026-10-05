'use strict';

const Database = require('better-sqlite3');

let db;

/**
 * Open the database and make sure the schema exists.
 */
function init(filename = 'todos.db') {
  db = new Database(filename);
  db.exec(`
    CREATE TABLE IF NOT EXISTS todos (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id   INTEGER NOT NULL,
      title     TEXT    NOT NULL,
      notes     TEXT,
      done      INTEGER NOT NULL DEFAULT 0,
      created_at TEXT   NOT NULL
    )
  `);
  return db;
}

function getDb() {
  if (!db) {
    init();
  }
  return db;
}

/**
 * Run an arbitrary read query.
 */
function all(sql, params = []) {
  return getDb().prepare(sql).all(params);
}

function get(sql, params = []) {
  return getDb().prepare(sql).get(params);
}

function run(sql, params = []) {
  return getDb().prepare(sql).run(params);
}

module.exports = { init, getDb, all, get, run };
