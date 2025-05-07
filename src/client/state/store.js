/**
 * Simple state management for the application
 */
class Store {
  #state = {
    raceData: null,
    currentRaceId: null,
    currentYear: null,
    currentStage: null,
    isLoading: false,
    error: null,
  };

  #listeners = new Set();

  getState() {
    return { ...this.#state };
  }

  setState(newState) {
    this.#state = { ...this.#state, ...newState };
    this.#notifyListeners();
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notifyListeners() {
    for (const listener of this.#listeners) {
      listener(this.#state);
    }
  }
}

export const store = new Store();
