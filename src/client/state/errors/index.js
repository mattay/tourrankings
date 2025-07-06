export {
  StoreSelectorError,
  StoreSelectorRegistrationError,
  StoreSelectorExecutionError,
} from "./store";
export {
  StatePropertyNotDefinedError,
  StatePropertyNotSetError,
  StatePropertyValueNotValidError,
} from "./state";
export { SelectionClassificationNotDefinedError } from "./selector";

/**
 * Predefined error codes and messages for consistency
 */
const ERROR_CODES = Object.freeze({
  STORE_SELECTOR_NOT_FOUND: "STORE_SELECTOR_NOT_FOUND",
  STORE_SELECTOR_EXECUTION_FAILED: "STORE_SELECTOR_EXECUTION_FAILED",
  STORE_SELECTOR_REGISTRATION_FAILED: "STORE_SELECTOR_REGISTRATION_FAILED",

  STATE_NOT_INITIALIZED: "STATE_NOT_INITIALIZED",
  STATE_PROPERTY_NOT_DEFINED: "STATE_PROPERTY_NOT_DEFINED",
  STATE_PROPERTY_NOT_SET: "STATE_PROPERTY_NOT_SET",
  STATE_PROPERTY_VALUE_NOT_VALID: "STATE_PROPERTY_VALUE_NOT_VALID",

  SELECTION_CLASSIFICATION_NOT_DEFINED: "SELECTION_CLASSIFICATION_NOT_DEFINED",
});

/**
 * Error message templates
 */
const ERROR_MESSAGES = Object.freeze({
  [ERROR_CODES.STORE_SELECTOR_NOT_FOUND]: 'Selector "{selectorName}" not found',
  [ERROR_CODES.STORE_SELECTOR_EXECUTION_FAILED]:
    'Selector "{selectorName}" execution failed: {reason}',
  [ERROR_CODES.STORE_SELECTOR_REGISTRATION_FAILED]:
    'Failed to register selector "{selectorName}": {reason}',

  [ERROR_CODES.STATE_NOT_INITIALIZED]: "State not initialized",
  [ERROR_CODES.STATE_PROPERTY_NOT_DEFINED]:
    'State has no property "{property}" defined',
  [ERROR_CODES.STATE_PROPERTY_NOT_SET]: 'State property "{property}" not set',
  [ERROR_CODES.STATE_PROPERTY_VALUE_NOT_VALID]:
    'State property "{property}" value "{value}" not valid',

  [ERROR_CODES.SELECTION_CLASSIFICATION_NOT_DEFINED]:
    "Selection of classification {selection} not defined",
});

/**
 * Formats error message with context variables
 * @param {string} code - Error code
 * @param {Object} context - Context variables
 * @returns {string} Formatted message
 */
function formatMessage(code, context = {}) {
  const template = ERROR_MESSAGES[code] || `Unknown error: ${code}`;

  return template.replace(/{([\w.]+)}/g, (match, key) => {
    const value = key.split(".").reduce((obj, prop) => obj?.[prop], context);
    return value !== undefined ? value : match;
  });
}

export { ERROR_CODES, formatMessage };
