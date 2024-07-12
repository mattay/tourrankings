/**
 * Generates a random integer within a specified range.
 *
 * @param {number} min - The minimum value of the range (inclusive).
 * @param {number} max - The maximum value of the range (inclusive).
 * @returns {number} - A random integer between min and max (inclusive).
 */
export function randomFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// https://stackoverflow.com/a/51200664/5250085
/**
 * Pauses execution for a specified number of milliseconds.
 *
 * @param {number} [milliseconds=500] - The number of milliseconds to sleep. Defaults to 500 milliseconds.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
export function sleep(milliseconds = 500) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
