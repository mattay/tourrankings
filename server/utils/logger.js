// @ts-check
import config from "../config.js";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

/**
 * Log levels
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
 * Format message with timestamp
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

/**
 * Logger object
 */
const logger = {
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

  warn(message) {
    if (logLevel >= levels.WARN) {
      console.warn(
        `${colors.yellow}${formatMessage("WARN", message)}${colors.reset}`,
      );
    }
  },

  info(message) {
    if (logLevel >= levels.INFO) {
      console.info(
        `${colors.green}${formatMessage("INFO", message)}${colors.reset}`,
      );
    }
  },

  debug(message) {
    if (logLevel >= levels.DEBUG) {
      console.debug(
        `${colors.blue}${formatMessage("DEBUG", message)}${colors.reset}`,
      );
    }
  },

  setLevel(level) {
    if (Object.values(levels).includes(level)) {
      logLevel = level;
    }
  },
};

export default logger;
