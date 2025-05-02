import { isoDateTime } from "./date.js";

const PADDINGDOMAIN = 32;

/**
 * Logs a message with a timestamp and a padded domain.
 *
 * @param {string} domain - The category or source of the log message.
 * @param {string} message - The message to log.
 * @param {"log" | "debug" | "info" | "warn" | "error"} [logLevel="log"] - The log level (defaults to "log").
 */
export function logOut(domain, message, logLevel = "log") {
  const timestamp = isoDateTime(new Date());
  console[logLevel](`${timestamp} ${domain.padEnd(PADDINGDOMAIN)} ${message}`);
}

/**
 * Logs an error message with a timestamp and a padded domain.
 *
 * @param {string} domain - The category or source of the error message.
 * @param {string} message - The error message to log.
 */
export function logError(domain, message) {
  const timestamp = isoDateTime(new Date());
  console.error(
    `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} ERROR: ${message}`,
  );
}
