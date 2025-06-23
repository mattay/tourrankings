import { ERROR_CODES, formatMessage } from ".";
/**
 * @typedef {import('../store/@types/store').State} State
 */

/**
 * Enhanced StateError class that automatically captures state context
 */
class StateError extends Error {
  /**
   * @param {string} message - Error message
   * @param {Object} state - The state object that caused the error
   * @param {Object} [additionalContext] - Additional context data
   */
  constructor(message, state, additionalContext = {}) {
    super(message);
    this.name = this.constructor.name;
    // this.state = this.sanitizeState(state);
    this.context = {
      // ...this.extractStateContext(state),
      ...additionalContext,
    };
    this.timestamp = new Date().toISOString();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Extracts relevant context from state for logging
   * @param {Object} state - The state object
   * @returns {Object} State context
   */
  extractStateContext(state) {
    if (!state || typeof state !== "object") {
      return {
        hasState: !!state,
        stateType: typeof state,
        stateValue: state,
      };
    }

    return {
      hasState: true,
      stateKeys: Object.keys(state),
      hasRaceData: !!state.raceData,
      raceDataKeys: state.raceData ? Object.keys(state.raceData) : null,
      selected: {
        race: state.currentRace,
        year: state.currentYear,
        stage: state.currentStage,
        classification: state.currentClassification,
      },
    };
  }
}

/**
 * Error thrown when state is not initialized
 */
class StateNotInitializedError extends StateError {
  /**
   * @param {State} state - The application state
   */
  constructor(state) {
    const type = ERROR_CODES.STATE_NOT_INITIALIZED;
    const context = {
      type,
    };
    const message = formatMessage(type, context);

    super(message, state, context);
  }
}

/**
 * Error thrown when a required state property is not defined
 */
class StatePropertyNotDefinedError extends StateError {
  /**
   * @param {State} state - The application state
   * @param {string} property - The selected state
   */
  constructor(state, property) {
    const type = ERROR_CODES.STATE_PROPERTY_NOT_DEFINED;
    const context = {
      type,
      property,
    };
    const message = formatMessage(type, context);

    super(message, state, context);
  }
}

/**
 * Error thrown when a required state property is not set
 */
class StatePropertyNotSetError extends StateError {
  /**
   * @param {State} state - The application state
   * @param {string} property - The selected state
   */
  constructor(state, property) {
    const type = ERROR_CODES.STATE_PROPERTY_NOT_SET;
    const context = {
      type,
      property,
    };
    const message = formatMessage(type, context);

    super(message, state, context);
  }
}

export {
  StateNotInitializedError,
  StatePropertyNotDefinedError,
  StatePropertyNotSetError,
};
