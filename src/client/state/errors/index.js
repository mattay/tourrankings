export {
  StoreSelectorError,
  StoreSelectorRegistrationError,
  StoreSelectorExecutionError,
} from "./store";

/**
 * Predefined error codes and messages for consistency
 */
const ERROR_CODES = Object.freeze({
  STORE_SELECTOR_NOT_FOUND: "STORE_SELECTOR_NOT_FOUND",
  STORE_SELECTOR_EXECUTION_FAILED: "STORE_SELECTOR_EXECUTION_FAILED",
  STORE_SELECTOR_REGISTRATION_FAILED: "STORE_SELECTOR_REGISTRATION_FAILED",
});

/**
 * Error message templates
 */
const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.STORE_SELECTOR_NOT_FOUND]: 'Selector "{selectorName}" not found',
  [ERROR_CODES.STORE_SELECTOR_EXECUTION_FAILED]:
    'Selector "{selectorName}" execution failed: {originalError.message}',
  [ERROR_CODES.STORE_SELECTOR_REGISTRATION_FAILED]:
    'Failed to register selector "{selectorName}": {reason}',
});

/**
 * Formats error message with context variables
 * @param {string} code - Error code
 * @param {Object} context - Context variables
 * @returns {string} Formatted message
 */
function formatMessage(code, context = {}) {
  const template = ERROR_MESSAGES[code] || `Unknown error: ${code}`;

  return template.replace(/{(\w+)}/g, (match, key) => {
    return context[key] !== undefined ? context[key] : match;
  });
}

export { ERROR_CODES, formatMessage };
