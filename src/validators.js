'use strict';

/**
 * Input validation for todo payloads.
 *
 * Every validator returns a plain result object rather than throwing, so that
 * callers can collect all problems with a payload in one pass instead of
 * surfacing them one exception at a time.
 */

const TITLE_MAX_LENGTH = 200;
const NOTES_MAX_LENGTH = 2000;

/** @typedef {{ valid: boolean, errors: string[] }} ValidationResult */

/**
 * @param {string[]} errors
 * @returns {ValidationResult}
 */
function result(errors) {
  return { valid: errors.length === 0, errors };
}

/**
 * Validate a todo title.
 *
 * @param {unknown} title
 * @returns {ValidationResult}
 */
function validateTitle(title) {
  const errors = [];

  if (typeof title !== 'string') {
    errors.push('title must be a string');
    return result(errors);
  }

  const trimmed = title.trim();

  if (trimmed.length === 0) {
    errors.push('title must not be empty');
  }

  if (trimmed.length > TITLE_MAX_LENGTH) {
    errors.push(`title must be at most ${TITLE_MAX_LENGTH} characters`);
  }

  return result(errors);
}

/**
 * Validate optional todo notes. Absent notes are valid.
 *
 * @param {unknown} notes
 * @returns {ValidationResult}
 */
function validateNotes(notes) {
  const errors = [];

  if (notes === undefined || notes === null) {
    return result(errors);
  }

  if (typeof notes !== 'string') {
    errors.push('notes must be a string');
    return result(errors);
  }

  if (notes.length > NOTES_MAX_LENGTH) {
    errors.push(`notes must be at most ${NOTES_MAX_LENGTH} characters`);
  }

  return result(errors);
}

/**
 * Validate a resource identifier arriving from a URL segment.
 *
 * @param {unknown} id
 * @returns {ValidationResult}
 */
function validateId(id) {
  const errors = [];
  const parsed = Number(id);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push('id must be a positive integer');
  }

  return result(errors);
}

/**
 * Validate a complete create-todo payload.
 *
 * @param {{ title?: unknown, notes?: unknown }} payload
 * @returns {ValidationResult}
 */
function validateCreatePayload(payload) {
  if (payload === null || typeof payload !== 'object') {
    return result(['payload must be an object']);
  }

  return result([
    ...validateTitle(payload.title).errors,
    ...validateNotes(payload.notes).errors
  ]);
}

module.exports = {
  TITLE_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  validateTitle,
  validateNotes,
  validateId,
  validateCreatePayload
};
