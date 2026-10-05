'use strict';

const test = require('node:test');
const assert = require('node:assert');

const {
  TITLE_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  validateTitle,
  validateNotes,
  validateId,
  validateCreatePayload
} = require('../src/validators');

test('validateTitle accepts a normal title', () => {
  assert.deepStrictEqual(validateTitle('buy milk'), { valid: true, errors: [] });
});

test('validateTitle rejects a non-string', () => {
  const { valid, errors } = validateTitle(42);
  assert.strictEqual(valid, false);
  assert.deepStrictEqual(errors, ['title must be a string']);
});

test('validateTitle rejects an empty or whitespace-only title', () => {
  assert.strictEqual(validateTitle('').valid, false);
  assert.strictEqual(validateTitle('    ').valid, false);
});

test('validateTitle accepts a title exactly at the length limit', () => {
  assert.strictEqual(validateTitle('a'.repeat(TITLE_MAX_LENGTH)).valid, true);
});

test('validateTitle rejects a title one character over the limit', () => {
  const { valid, errors } = validateTitle('a'.repeat(TITLE_MAX_LENGTH + 1));
  assert.strictEqual(valid, false);
  assert.match(errors[0], /at most 200 characters/);
});

test('validateNotes treats absent notes as valid', () => {
  assert.strictEqual(validateNotes(undefined).valid, true);
  assert.strictEqual(validateNotes(null).valid, true);
});

test('validateNotes rejects a non-string', () => {
  assert.strictEqual(validateNotes({}).valid, false);
});

test('validateNotes rejects notes over the limit', () => {
  assert.strictEqual(validateNotes('x'.repeat(NOTES_MAX_LENGTH + 1)).valid, false);
});

test('validateId accepts a positive integer in string form', () => {
  assert.strictEqual(validateId('7').valid, true);
});

test('validateId rejects zero, negatives, fractions, and junk', () => {
  for (const bad of ['0', '-1', '1.5', 'abc', '', null]) {
    assert.strictEqual(validateId(bad).valid, false, `expected ${bad} to be rejected`);
  }
});

test('validateCreatePayload collects every error at once', () => {
  const { valid, errors } = validateCreatePayload({ title: '', notes: 123 });

  assert.strictEqual(valid, false);
  assert.strictEqual(errors.length, 2);
});

test('validateCreatePayload rejects a non-object payload', () => {
  assert.deepStrictEqual(validateCreatePayload(null).errors, ['payload must be an object']);
});

test('validateCreatePayload accepts a minimal valid payload', () => {
  assert.strictEqual(validateCreatePayload({ title: 'walk the dog' }).valid, true);
});
