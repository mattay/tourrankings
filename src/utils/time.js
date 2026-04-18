/**
 * Converts a time string formatted as HH:MM:SS into total seconds.
 *
 * @param {string} time - The time string to convert.
 * @returns {number} - The total number of seconds.
 */
export function stringToSeconds(time) {
  return time
    .split(":")
    .map(Number)
    .reverse()
    .reduce((seconds, section, position) => {
      if (position == 0) {
        return section;
      } else {
        return section * 60 ** position + seconds;
      }
    }, 0);
}

/**
 * Formats a number of seconds into a time string formatted as HH:MM:SS.
 *
 * @param {number} number - The number of seconds to format.
 * @returns {string} - The formatted time string.
 */
export function formatSeconds(number) {
  if (isNaN(number)) return;

  const hours = Math.floor(number / 3600);
  const minutes = Math.floor((number % 3600) / 60);
  const seconds = number % 60;

  return [hours, minutes, seconds]
    .map((section) => section.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Adds two time values together. Time values can be either a string formatted as HH:MM:SS or a number of seconds.
 *
 * @param {string|number} a - The first time value to add.
 * @param {string|number} b - The second time value to add.
 * @returns {number} - The sum of the two time values in seconds.
 */
export function addTime(a, b) {
  const timeA = typeof a === "string" ? stringToSeconds(a) : a;
  const timeB = typeof b === "string" ? stringToSeconds(b) : b;

  return timeA + timeB;
}
