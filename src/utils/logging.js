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
 * Logs an error message with a timestamp and a padded domain.
 *
 * @param {string} domain - The category or source of the error message.
 * @param {string} message - The error message to log.
 * @param {Error|null} [error] - The error object to log.
 * @param {any} [data] - Additional data to log.
 */
export function logError(domain, message, error = null, data) {
  const timestamp = isoDateTime(new Date());
  console.error(
    `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [ERROR] ${message}`,
  );
  if (error) {
    console.error(
      `${timestamp} ${domain.padEnd(PADDINGDOMAIN)} [ERROR NAME] ${error.name}`,
    );
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
