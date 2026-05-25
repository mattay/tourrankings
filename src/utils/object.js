/**
 * Renames every key in an object using a provided renaming function.
 *
 * @param {Object} obj - The object whose keys are to be renamed.
 * @param {Function} renameFn - A function that takes a key as an argument and returns the new key.
 * @returns {Object} - A new object with the keys renamed.
 */
export function renameKeys(obj, renameFn) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [renameFn(key), value]),
  );
}

/**
 * Creates a new object with the specified keys removed.
 *
 * @param {Object} obj - The source object to copy keys from.
 * @param {string[]} dropKeyList - Array of key names to exclude from the result.
 * @returns {Object} A new object with all original properties except those in `dropKeyList`.
 */
export function dropValues(obj, dropKeyList) {
  const result = { ...obj };
  for (const key of dropKeyList) {
    delete result[key];
  }
  return result;
}
