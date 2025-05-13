/**
 * Simple state management for the application.
 * Provides methods to get, set, and subscribe to state changes,
 * as well as to register and use selector functions for derived data.
 */
class Store {
  /**
   * @typedef {Object} State
   * @property {?Object} raceData - Data related to the race.
   * @property {?string|number} currentRaceId - The current race identifier.
   * @property {?number} currentYear - The current year.
   * @property {?string|number} currentStage - The current stage identifier.
   * @property {boolean} isLoading - Loading state.
   * @property {?Error|string} error - Error information, if any.
   */

  /**
   * Internal state object.
   * @type {State}
   */
  #state = {
    raceData: null,
    currentRaceId: null,
    currentYear: null,
    currentStage: null,
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
    this.#selectors.set(selectorName, selectorFn);
    return this;
  }

  /**
   * Retrieves processed data using a registered selector.
   * @param {string} selectorName - The name of the selector to use.
   * @returns {any} The result of the selector function.
   * @throws {Error} If the selector is not found.
   */
  select(selectorName) {
    const selector = this.#selectors.get(selectorName);
    if (!selector) throw new Error(`Selector "${selectorName}" not found`);
    return selector(this.#state);
  }
}

/**
 * The singleton store instance for the application.
 * @type {Store}
 */
export const store = new Store();
