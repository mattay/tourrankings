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
export function stateCheckSelected(state, selected) {
  validateStateInitialized(state);

  for (const key in selected) {
    // Check state properties exist
    if (!Object.hasOwn(state.selected, key)) {
      throw new StatePropertyNotDefinedError(state, `selected.${key}`);
    }
    // Check values we need are set
    if (selected[key] && state.selected[key] == null) {
      throw new StatePropertyNotSetError(state, `selected.${key}`);
    }

    // Check classification key is valid
    if (key === "classification") {
      stateCheckClassificationType(state);
    }
  }

  return true;
}

/**
 * Validates that the state's selected classification type is valid.
 *
 * Checks if the value of `state.selected.classification` is a valid classification type.
 * Throws a {@link StatePropertyValueNotValidError} if the classification is invalid.
 *
 * @param {State} state - The application state object containing the selected classification.
 * @returns {true} Returns true if the classification type is valid.
 * @throws {StatePropertyValueNotValidError} If the classification type is invalid.
 *
 * @example
 * try {
 *   stateCheckClassificationType(state);
 * } catch (err) {
 *   // Handle invalid classification type
 * }
 */
function stateCheckClassificationType(state) {
  const classification = state.selected.classification;
  if (!isValidClassificationType(classification)) {
    throw new StatePropertyValueNotValidError(
      state,
      "classification",
      classification,
    );
  }

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
    (!state.sportData?.riders || !Array.isArray(state.sportData.riders))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.riders");
  }

  if (
    results &&
    (!state.sportData?.results || !Array.isArray(state.sportData.results))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.results");
  }

  if (
    classifications &&
    (!state.sportData?.classifications ||
      !Array.isArray(state.sportData.classifications))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.classifications");
  }

  return true;
}
