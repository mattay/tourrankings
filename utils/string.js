/**
 * Converts a string to camelCase.
 * @param {string} str - The input string.
 * @returns {string} The camelCase string.
 */
export function toCamelCase(str) {
  return str
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase()) // Convert the first character to lowercase
    .replace(/[\s_]+(.)/g, (_, chr) => chr.toUpperCase()) // Convert underscores or spaces followed by a letter to uppercase
    .replace(/[^a-zA-Z0-9]/g, ""); // Remove any non-alphanumeric characters
}

/**
 * Converts the first character of a string to uppercase.
 * @param {string} str - The input string.
 * @returns {string} The string with the first character converted to uppercase.
 */
export function toTitleCase(str) {
  return str.replace(/^[a-z]/, (chr) => chr.toUpperCase());
}
