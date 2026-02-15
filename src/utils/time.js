/**  */
const patternCyclingTime =
  /^(?:(?:(?<hours>\d{1,2}):)?(?<minutes>\d{1,2}):(?<seconds>\d{2})(?:.(?<milliseconds>\d{2}))?|(?<ttMinutes>\d{1,3})\.(?<ttSeconds>\d{2}),(?<ttMilliseconds>\d{1,2}))$/;

/**
 * Converts a time string formatted as HH:MM:SS into total seconds.
 *
 * @param {string} timeStr - The time string to convert.
 * @returns {number} - The total number of seconds.
 */
export function stringToSeconds(timeStr) {
  const match = timeStr.match(patternCyclingTime);

  if (!match) return 0;

  let h, m, s, ms;

  if (match[2] !== undefined) {
    // Road Stage: HH:MM:SS
    [h, m, s, ms] = [
      match.groups?.hours || 0,
      match.groups?.minutes || 0,
      match.groups?.seconds || 0,
      match.groups?.milliseconds || 0,
    ];
  } else {
    // Time Trial: MM.SS,MS
    [h, m, s, ms] = [
      0,
      match.groups?.ttMinutes || 0,
      match.groups?.ttSeconds || 0,
      match.groups?.ttMilliseconds || 0,
    ];
  }

  // Use padEnd(2, '0') to ensure ",5" becomes 50 centiseconds (.5s)
  const subSeconds = ms ? parseFloat("0." + ms.toString().padEnd(2, "0")) : 0;

  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + subSeconds;
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
  const seconds = Math.floor(number % 60); // Use floor to remove decimals
  const ms = Math.round((number % 1) * 100); // Get centiseconds

  const pad = (num) => num.toString().padStart(2, "0");

  const baseTime = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  // Only append .MS if there are actually centiseconds
  return ms > 0 ? `${baseTime}.${pad(ms)}` : baseTime;
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
