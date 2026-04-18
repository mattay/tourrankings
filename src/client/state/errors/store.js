import { ERROR_CODES, formatMessage } from ".";

/**
 * Base class for all store-related errors
 */
class StoreError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} [context] - Additional context data
   */
  constructor(message, context) {
    super(message);
    this.name = this.constructor.name;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Returns a formatted error message with context
   * @returns {string}
   */
  getDetailedMessage() {
    const contextStr =
      this.context && Object.keys(this.context).length > 0
        ? `Context: ${JSON.stringify(this.context, null, 2)}`
        : "";

    return `${this.message}${contextStr ? "\n" + contextStr : ""}`;
  }
}

/**
 * Error thrown when a selector is not found in the store
 */
class StoreSelectorError extends StoreError {
  /**
   * @param {string} selectorName - Name of the missing selector
   * @param {Array<string>} availableSelectors - List of available selector names
   */
  constructor(selectorName, availableSelectors = []) {
    const type = ERROR_CODES.STORE_SELECTOR_NOT_FOUND;
    const context = {
      selectorName,
      availableSelectors,
      type,
    };
    const message = formatMessage(type, context);

    super(message, context);
  }
}

/**
 * Error thrown when a selector function fails during execution
 */
class StoreSelectorExecutionError extends StoreError {
  /**
   * @param {string} selectorName - Name of the selector that failed
   * @param {Error} originalError - The original error that was thrown
   * @param {Object} state - The state that was passed to the selector
   */
  constructor(selectorName, originalError, state = null) {
    const type = ERROR_CODES.STORE_SELECTOR_EXECUTION_FAILED;
    const context = {
      selectorName,
      originalError: originalError?.name || "Unknown",
      originalMessage: originalError?.message || "No error message",
      state: state ? Object.keys(state) : null,
      type,
    };
    const message = formatMessage(type, context);

    super(message, context);
  }
}

/**
 * Error thrown when attempting to register an invalid selector
 */
class StoreSelectorRegistrationError extends StoreError {
  /**
   * @param {string} selectorName - Name of the selector
   * @param {string} reason - Reason for the registration failure
   */
  constructor(selectorName, reason) {
    const type = ERROR_CODES.STORE_SELECTOR_REGISTRATION_FAILED;
    const context = {
      selectorName,
      reason,
      type,
    };
    const message = formatMessage(type, context);

    super(message, context);
  }
}

export {
  StoreSelectorError,
  StoreSelectorExecutionError,
  StoreSelectorRegistrationError,
};
