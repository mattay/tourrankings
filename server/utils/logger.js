import config from "../config.js";

// ANSI color codes for terminal output
/**
 * @typedef {Object} LoggerColors
 * @property {string} reset
 * @property {string} red
 * @property {string} green
 * @property {string} yellow
 * @property {string} blue
 * @property {string} magenta
 */

/** @type {LoggerColors} */
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

/**
 * Log levels (higher number = more verbose)
 * @readonly
 * @enum {number}
 */
const levels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Set default log level based on environment
let logLevel = config.env === "production" ? levels.INFO : levels.DEBUG;

/**
 * Formats a log message with an ISO timestamp and log level.
 *
 * @param {string} level - The log level (e.g., "INFO", "ERROR").
 * @param {string} message - The log message.
 * @returns {string} The formatted log message.
 */
function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

/**
 * Logger object for structured and colored console logging.
 *
 * @typedef {Object} Logger
 * @property {(message: string, error?: Error) => void} error - Log an error message and optional error stack.
 * @property {(message: string) => void} warn - Log a warning message.
 * @property {(message: string) => void} info - Log an informational message.
 * @property {(message: string) => void} debug - Log a debug message.
 * @property {(level: number) => void} setLevel - Set the minimum log level (see `levels`).
 */

/** @type {Logger} */
const logger = {
  /**
   * Log an error message with optional error stack trace.
   * @param {string} message - Error message.
   * @param {Error} [error] - Optional error object for stack trace.
   * @returns {void}
   */
  error(message, error) {
    if (logLevel >= levels.ERROR) {
      console.error(
        `${colors.red}${formatMessage("ERROR", message)}${colors.reset}`,
      );
      if (error && error.stack) {
        console.error(`${colors.red}${error.stack}${colors.reset}`);
      }
    }
  },

  /**
   * Log a warning message.
   * @param {string} message - Warning message.
   * @returns {void}
   */
  warn(message) {
    if (logLevel >= levels.WARN) {
      console.warn(
        `${colors.yellow}${formatMessage("WARN", message)}${colors.reset}`,
      );
    }
  },

  /**
   * Log an informational message.
   * @param {string} message - Info message.
   * @returns {void}
   */
  info(message) {
    if (logLevel >= levels.INFO) {
      console.info(
        `${colors.green}${formatMessage("INFO", message)}${colors.reset}`,
      );
    }
  },

  /**
   * Log a debug message.
   * @param {string} message - Debug message.
   * @returns {void}
   */
  debug(message) {
    if (logLevel >= levels.DEBUG) {
      console.debug(
        `${colors.blue}${formatMessage("DEBUG", message)}${colors.reset}`,
      );
    }
  },

  /**
   * Set the minimum log level for output.
   * @param {number} level - New log level (see `levels` enum).
   * @returns {void}
   */
  setLevel(level) {
    if (Object.values(levels).includes(level)) {
      logLevel = level;
    }
  },
};

export default logger;
