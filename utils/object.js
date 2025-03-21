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
