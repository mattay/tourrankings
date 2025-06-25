import { ERROR_CODES, formatMessage } from ".";

class SelectorError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} [selector] - Name of the selector that failed
   * @param {Object} [context] - Additional context data
   */
  constructor(message, selector, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.selector = selector;
    this.context = context;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class SelectionError extends Error {
  /**
   * @param {string} message - Error message
   * @param {string} [selection] - Name of the selection that failed
   * @param {Object} [context] - Additional context data
   */
  constructor(message, selection, context = {}) {
    super(message);
    this.name = this.constructor.name;
    this.selection = selection;
    this.context = context;
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when state is not initialized
 */
class SelectionClassificationNotDefinedError extends SelectionError {
  /**
   * @param {string} selection - The application state
   */
  constructor(selection) {
    const type = ERROR_CODES.SELECTION_CLASSIFICATION_NOT_DEFINED;
    const context = {
      selection,
      type,
    };
    const message = formatMessage(type, context);

    super(message, selection, context);
  }
}

export { SelectionClassificationNotDefinedError };
