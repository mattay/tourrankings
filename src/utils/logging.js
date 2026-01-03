import { isoDateTime } from "./date.js";

const PADDINGDOMAIN = 32;

/**
 * Logs a message with a timestamp and a padded domain.
 *
 * @param {string} domain - The category or source of the log message.
 * @param {string} message - The message to log.
 * @param {"log" | "debug" | "info" | "warn" | "error"} [logLevel="log"] - The log level (defaults to "log").
 * @param {any} [data] - Additional data to log.
 */
export function logOut(domain, message, logLevel = "log", data) {
  const timestamp = isoDateTime(new Date());
  console[logLevel](`${timestamp} ${domain.padEnd(PADDINGDOMAIN)} ${message}`);

  if (typeof data !== "undefined") {
    console[logLevel](
      `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [DEBUG VALUE]`,
      data,
    );
  }
}

/**
 * Log an error record with a timestamp and padded domain.
 *
 * If an `Error` is provided, its `name` and `message` are logged on separate lines.
 * If `data` is provided (not `undefined`), it is logged on a separate "[DEBUG VALUE]" line.
 *
 * @param {string} domain - Category or source used to label the log entry.
 * @param {string} message - The error message to log.
 * @param {Error|null} [error] - Optional Error whose `name` and `message` will be logged.
 * @param {any} [data] - Optional additional payload to log as a debug value.
 */
export function logError(domain, message, error = null, data) {
  const timestamp = isoDateTime(new Date());
  console.error(
    `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [ERROR] ${message}`,
  );
  if (error) {
    console.error(
      `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [ERROR MESSAGE] ${error.message}`,
    );
  }
  if (typeof data !== "undefined") {
    console.error(
      `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [DEBUG VALUE]`,
      data,
    );
  }
}
