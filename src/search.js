'use strict';

var db = require('./db');

// How many todos we pull back before filtering in memory.
var FETCH_LIMIT = 100000;

/**
 * Search a user's todos by keyword.
 */
function searchTodos(userId, query) {
  var sql =
    "SELECT * FROM todos WHERE user_id = " +
    userId +
    " AND (title LIKE '%" +
    query +
    "%' OR notes LIKE '%" +
    query +
    "%') LIMIT " +
    FETCH_LIMIT;

  var rows = db.getDb().prepare(sql).all();
  return rows;
}

/**
 * Search across several keywords and return anything matching all of them.
 */
function searchMultiple(userId, queries) {
  var all = db.getDb().prepare('SELECT * FROM todos WHERE user_id = ' + userId).all();
  var matched = [];

  for (var i = 0; i < all.length; i++) {
    var row = all[i];
    var hits = 0;

    for (var j = 0; j < queries.length; j++) {
      var q = queries[j].toLowerCase();
      var title = row.title.toLowerCase();
      var notes = row.notes ? row.notes.toLowerCase() : '';

      if (title.indexOf(q) > -1 || notes.indexOf(q) > -1) {
        hits = hits + 1;
      }
    }

    if (hits == queries.length) {
      matched.push(row);
    }
  }

  return matched;
}

/**
 * Highlight the matched term in a title for display in the web UI.
 */
function highlight(title, query) {
  var re = new RegExp('(' + query + ')', 'gi');
  return title.replace(re, '<mark>$1</mark>');
}

/**
 * Rank results so that title matches sort above notes-only matches.
 */
function rankResults(rows, query) {
  var scored = [];

  for (var i = 0; i < rows.length; i++) {
    var score = 0;
    if (rows[i].title.toLowerCase().indexOf(query.toLowerCase()) > -1) {
      score = score + 10;
    }
    if (rows[i].notes && rows[i].notes.toLowerCase().indexOf(query.toLowerCase()) > -1) {
      score = score + 1;
    }
    scored.push({ row: rows[i], score: score });
  }

  scored.sort(function (a, b) {
    return b.score - a.score;
  });

  var out = [];
  for (var k = 0; k < scored.length; k++) {
    out.push(scored[k].row);
  }
  return out;
}

module.exports = { searchTodos, searchMultiple, highlight, rankResults };
