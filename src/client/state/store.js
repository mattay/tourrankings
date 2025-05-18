/**
 * Simple state management for the application.
 *
 * The Store holds global app state, allows components to read the state,
 * update it, and subscribe to changes. All state updates are shallow-merged.
 *
 * @class
 */
class Store {
  /**
   * @typedef {Object} StoreState
   * @property {any} raceData
   * @property {string|null} currentRaceId
   * @property {number|null} currentYear
   * @property {number|null} currentStage
   * @property {boolean} isLoading
   * @property {any} error
   */

  /** @type {StoreState} */
  #state = {
    raceData: null,
    currentRaceId: null,
    currentYear: null,
    currentStage: null,
    isLoading: false,
    error: null,
  };

  /**
   * @type {Set<function(Object): void>}
   * Set of subscribed listener functions.
   */
  #listeners = new Set();

  /**
   * Get a shallow copy of the current application state.
   * @returns {StoreState}
   */
  getState() {
    return { ...this.#state };
  }

  /**
   * Update the state with new values (shallow merge) and notify all listeners.
   * @param {Partial<StoreState>} newState - Object with state properties to update.
   */
  setState(newState) {
    this.#state = { ...this.#state, ...newState };
    this.#notifyListeners();
  }

  /**
   * Subscribe to state changes.
   * The listener will be called with the new state whenever it changes.
   * @param {(state: StoreState) => void} listener - Function to call on state change.
   * @returns {() => void} Unsubscribe function.
   *
   * @example
   * const unsubscribe = store.subscribe((state) => {
   *   console.log('New state:', state);
   * });
   * // Later, to unsubscribe:
   * unsubscribe();
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Notify all subscribed listeners of the new state.
   */
  #notifyListeners() {
    for (const listener of this.#listeners) {
      listener(this.#state);
    }
  }
}

export const store = new Store();
