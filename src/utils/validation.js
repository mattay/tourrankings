/**
 * Validates that the DATA_DIR environment variable is defined.
 * @throws {Error} If DATA_DIR environment variable is not defined.
 */
export function validateDataDir() {
  if (!process.env.DATA_DIR || !process.env.DATA_DIR.trim()) {
    throw new Error(
      "DATA_DIR environment variable is not defined. " +
        "Please set it in your .env file or environment. " +
        "Example: DATA_DIR=./data/csv/",
    );
  }
}

/**
 * Gets the data directory path, validating it first.
 * @returns {string} The DATA_DIR path.
 * @throws {Error} If DATA_DIR environment variable is not defined.
 */
export function getDataDir() {
  validateDataDir();
  return process.env.DATA_DIR.trim();
}
