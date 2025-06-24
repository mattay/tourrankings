import {
  StateNotInitializedError,
  StatePropertyNotDefinedError,
  StatePropertyNotSetError,
} from "../errors/state";
/**
 * @typedef {import('./@types/store').State} State
 */

/**
 * @param {State} state - The application state
 * @throws {StateNotInitializedError} Throws an error if the state is undefined or not an object.
 */
function validateStateInitialized(state) {
  if (!state || typeof state !== "object") {
    throw new StateNotInitializedError(state);
  }
}

/**
 * @typedef {Object} Selected
 * @param {boolean} race - Check for current race
 * @param {boolean} year - Check for current stage
 * @param {boolean} stage - Check for current stage
 * @param {boolean} classification - Check for current classification
 */

/**
 * @param {State} state - The application state
 * @param {Selected} selected - Check for current selected
 * @throws {StateNotInitializedError|StatePropertyNotDefinedError|StatePropertyNotSetError} Throws an error if the state is undefined, stage is not set, or classification is not set.
 */
export const stateCheckSelected = (state, selected) => {
  validateStateInitialized(state);

  for (const key in selected) {
    // Check state properties exist
    if (!Object.hasOwn(state.selected, key)) {
      throw new StatePropertyNotDefinedError(state, key);
    }
    // Check values we need are set
    if (selected[key] && state[key] == null) {
      throw new StatePropertyNotSetError(state, key);
    }
  }

  return true;
};

/**
 * @param {State} state - The application state
 * @param {boolean} riders - Check for riders data
 * @param {boolean} results - Check for results data
 * @param {boolean} classifications - Check for classifications data
 * @returns {boolean} Returns true if all validations pass
 * @throws {StateNotInitializedError|StatePropertyNotDefinedError|StatePropertyNotSetError} Throws an error if validation fails

 */
export function stateCheckRaceData(
  state,
  riders = false,
  results = false,
  classifications = false,
) {
  validateStateInitialized(state);

  // Check state properties exist
  if (!Object.hasOwn(state, "raceData"))
    throw new StatePropertyNotDefinedError(state, "raceData");

  // Check values we need are set
  if (
    riders &&
    (!state.raceData?.riders || !Array.isArray(state.raceData.riders))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.riders");
  }

  if (
    results &&
    (!state.raceData?.results || !Array.isArray(state.raceData.results))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.results");
  }

  if (
    classifications &&
    (!state.raceData?.classifications ||
      !Array.isArray(state.raceData.classifications))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.classifications");
  }

  return true;
}
