/**
 * Parses boolean from string, case-insensitive
 *
 * @param {string} value - The value to parse
 * @param {boolean} defaultValue - Default value if parsing fails
 * @returns {boolean} Parsed boolean value
 */
export function parseBool(value, defaultValue) {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.toLowerCase().trim();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return defaultValue;
}
