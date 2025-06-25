import { isValidClassificationType } from "../../../core/cycling/classification/classification";
import {
  StateNotInitializedError,
  StatePropertyNotDefinedError,
  StatePropertyNotSetError,
  StatePropertyValueNotValidError,
} from "../errors/state";

/**
 * @typedef {import('./@types/store').State} State
 */

/**
 * Validates that the application state is initialized and is an object.
 *
 * @param {State} state - The application state to validate.
 * @throws {StateNotInitializedError} If the state is undefined, null, or not an object
 * */
function validateStateInitialized(state) {
  if (!state || typeof state !== "object") {
    throw new StateNotInitializedError(state);
  }
}

/**
 * @typedef {Object} Selected
 * @property {boolean} [race] - Whether to check for the current race.
 * @property {boolean} [year] - Whether to check for the current year.
 * @property {boolean} [stage] - Whether to check for the current stage.
 * @property {boolean} [classification] - Whether to check for the current classification.
 */

/**
 * Validates that the required properties in `state.selected` are defined and set.
 *
 * For each property in the `selected` object that is `true`, this function checks:
 *   - The property exists in `state.selected`.
 *   - The property is not `null` or `undefined`.
 *   - If the property is `classification`, its value is a valid classification type.
 *
 * @param {State} state - The application state object.
 * @param {Selected} selected - An object specifying which properties to check.
 * @returns {true} Returns true if all specified properties are defined and set.
 * @throws {StateNotInitializedError} If the state is not initialized.
 * @throws {StatePropertyNotDefinedError} If a required property is not defined in `state.selected`.
 * @throws {StatePropertyNotSetError} If a required property is not set (null or undefined).
 * @throws {StatePropertyValueNotValidError} If the classification value is not valid.
 *
 * @example
 * // Will check that 'stage' and 'classification' are defined and set in state.selected
 * stateCheckSelected(state, { stage: true, classification: true });
 */
export function stateCheckSelected(state, selected) {
  validateStateInitialized(state);

  for (const key in selected) {
    // Check state properties exist
    if (!Object.hasOwn(state.selected, key)) {
      throw new StatePropertyNotDefinedError(state, `selected.${key}`);
    }
    // Check values we need are set
    if (selected[key] && state.selected[key] === null) {
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

  return true;
}

/**
 * Validates that the race data and its required sub-properties exist and are properly set in the application state.
 *
 * Checks for the existence of `sportData` on the state object, and optionally checks for
 * the presence and validity of `riders`, `results`, and `classifications` arrays within `sportData`.
 *
 * @param {State} state - The application state object.
 * @param {boolean} [riders=false] - Whether to validate the presence of the riders array.
 * @param {boolean} [results=false] - Whether to validate the presence of the results array.
 * @param {boolean} [classifications=false] - Whether to validate the presence of the classifications array.
 * @returns {true} Returns true if all validations pass.
 * @throws {StateNotInitializedError} If the state is not initialized or not an object.
 * @throws {StatePropertyNotDefinedError} If the `sportData` property is missing on the state.
 * @throws {StatePropertyNotSetError} If a required property is missing or not an array.
 *
 * @example
 * // Validate that sportData and its riders and results arrays are present and valid
 * stateCheckSportData(state, true, true);
 */
export function stateCheckSportData(
  state,
  riders = false,
  results = false,
  classifications = false,
) {
  validateStateInitialized(state);

  // Check state properties exist
  if (!Object.hasOwn(state, "sportData"))
    throw new StatePropertyNotDefinedError(state, "sportData");

  // Check values we need are set
  if (
    riders &&
    (!state.sportData?.riders || !Array.isArray(state.sportData.riders))
  ) {
    throw new StatePropertyNotSetError(state, "sportData.riders");
  }

  if (
    results &&
    (!state.sportData?.results || !Array.isArray(state.sportData.results))
  ) {
    throw new StatePropertyNotSetError(state, "sportData.results");
  }

  if (
    classifications &&
    (!state.sportData?.classifications ||
      !Array.isArray(state.sportData.classifications))
  ) {
    throw new StatePropertyNotSetError(state, "sportData.classifications");
  }

  return true;
}
