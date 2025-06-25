/**
 * @typedef {import('./@types/store').State} State
 */

import {
  StoreSelectorError,
  StoreSelectorExecutionError,
  StoreSelectorRegistrationError,
} from "../errors/store";

/**
 * Simple state management for the application.
 * Provides methods to get, set, and subscribe to state changes,
 * as well as to register and use selector functions for derived data.
 * @class
 */
class Store {
  /**
   * Internal state object.
   * @type {State}
   */
  #state = {
    sport: "cycling",
    sportData: null,
    previouslySelected: {
      raceId: null,
      year: null,
      stage: null,
      classification: null,
    },
    selected: {
      raceId: null,
      year: null,
      stage: null,
      classification: null,
    },
    isLoading: false,
    error: null,
  };

  /**
   * Set of listener functions subscribed to state changes.
   * @type {Set<function(State):void>}
   */
  #listeners = new Set();

  /**
   * Map of selector functions for computing derived data from state.
   * @type {Map<string, function(State):any>}
   */
  #selectors = new Map();

  constructor({ strictMode = process.env.NODE_ENV === "development" } = {}) {
    this.strictMode = strictMode;
  }

  /**
   * Checks if a selector exists.
   * @param {string} selectorName - The name of the selector to check.
   * @returns {boolean} True if the selector exists.
   */
  hasSelector(selectorName) {
    return this.#selectors.has(selectorName);
  }

  /**
   * Gets a list of all registered selector names.
   * @returns {Array<string>} Array of selector names.
   */
  getAvailableSelectors() {
    return Array.from(this.#selectors.keys());
  }

  /**
   * Returns a shallow copy of the current state.
   * @returns {State} The current state object.
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Updates the state with new values and notifies all subscribers.
   * @param {Partial<State>} newState - An object with updated state properties.
   * @returns {void}
   */
  setState(newState) {
    this.#state = { ...this.#state, ...newState };
    this.#notifyListeners();
  }

  /**
   * Subscribes a listener function to state changes.
   * The listener will be called with the new state whenever it changes.
   * @param {function(State):void} listener - The function to call on state updates.
   * @returns {function():void} A function to unsubscribe the listener.
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Notifies all subscribed listeners of the current state.
   * @returns {void}
   */
  #notifyListeners() {
    for (const listener of this.#listeners) {
      listener(this.#state);
    }
  }

  /**
   * Registers a selector function that computes derived data from the state.
   * @param {string} selectorName - The unique name for the selector.
   * @param {function(State):any} selectorFn - The selector function.
   * @returns {Store} The store instance (for chaining).
   */
  registerSelector(selectorName, selectorFn) {
    // Validation
    if (typeof selectorName !== "string" || selectorName.trim() === "") {
      throw new StoreSelectorRegistrationError(
        selectorName,
        "Selector name must be a non-empty string",
      );
    }

    if (typeof selectorFn !== "function") {
      throw new StoreSelectorRegistrationError(
        selectorName,
        "Selector must be a function",
      );
    }

    if (this.hasSelector(selectorName)) {
      throw new StoreSelectorRegistrationError(
        selectorName,
        "Selector with this name already exists",
      );
    }

    this.#selectors.set(selectorName, selectorFn);
    return this;
  }

  /**
   * Removes a selector from the store.
   * @param {string} selectorName - The name of the selector to remove.
   * @returns {boolean} True if the selector was removed, false if it didn't exist.
   */
  unregisterSelector(selectorName) {
    return this.#selectors.delete(selectorName);
  }

  /**
   * Handles errors thrown by selectors.
   * @param {StoreSelectorError|StoreSelectorExecutionError} error - The error thrown by the selector.
   * @param {any} fallbackValue - The value to return if the selector fails.
   * @returns {any} The fallback value.
   */
  #handleSelectorError(error, fallbackValue) {
    if (this.strictMode) {
      throw error;
    } else {
      console.warn(error.message);
      return fallbackValue;
    }
  }

  /**
   * Retrieves processed data using a registered selector.
   * Throws in development, returns fallback in production.
   *
   * @param {string} selectorName - The name of the selector to use.
   * @param {any} fallbackValue - The value to return if the selector is not found or fails.
   * @returns {any} The result of the selector function or the fallback value.
   * @throws {StoreSelectorError|StoreSelectorExecutionError} In development mode.
   */
  select(selectorName, fallbackValue = null) {
    const selector = this.#selectors.get(selectorName);
    if (!selector) {
      return this.#handleSelectorError(
        new StoreSelectorError(selectorName, this.getAvailableSelectors()),
        fallbackValue,
      );
    }

    try {
      return selector(this.#state);
    } catch (error) {
      return this.#handleSelectorError(
        new StoreSelectorExecutionError(selectorName, error, this.#state),
        fallbackValue,
      );
    }
  }
}

export default Store;
