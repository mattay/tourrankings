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
 * @param {boolean} stage - Check for current stage
 * @param {boolean} classification - Check for current classification
 * @throws {StateError} Throws an error if the state is undefined, currentStage is not set, or currentClassification is not set.
 */
export const stateCheckSelected = (
  state,
  stage = false,
  classification = false,
) => {
  // Check if state is undefined
  if (!state || typeof state !== "object")
    throw new StateNotInitializedError(state);

  // Check state properties exist
  if (!Object.hasOwn(state, "currentStage"))
    throw new StatePropertyNotDefinedError(state, "currentStage");
  if (!Object.hasOwn(state, "currentClassification"))
    throw new StatePropertyNotDefinedError(state, "currentClassification");

  // Check values we need are set
  if (stage && state.currentStage == null) {
    throw new StatePropertyNotSetError(state, "currentStage");
  }
  if (classification && state.currentClassification == null) {
    throw new StatePropertyNotSetError(state, "currentClassification");
  }

  return true;
};

/**
 * @param {State} state - The application state
 * @param {boolean} riders - Check for riders data
 * @param {boolean} results - Check for results data
 * @param {boolean} classifications - Check for classifications data
 */
export function stateCheckRaceData(
  state,
  riders = false,
  results = false,
  classifications = false,
) {
  // Check if state is undefined
  if (!state || typeof state !== "object")
    throw new StateNotInitializedError(state);

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
    (!state?.raceData?.classifications ||
      !Array.isArray(state.raceData.classifications))
  ) {
    throw new StatePropertyNotSetError(state, "raceData.classifications");
  }

  return true;
}
