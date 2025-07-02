import { SelectionClassificationNotDefinedError } from "../../../errors/selector";
import { stateCheckSelected } from "../../../store/stateCheck";
import { CLASSIFICATION_TYPES } from "../../../../../core/cycling/classification/classification";

/**
 * @typedef {import('../../../store/@types/store').State} State
 * @typedef {import('../../@types/result').FilteredStageResult} FilteredStageResult
 * @typedef {import('../../@types/classifications').FilteredClassifications} FilteredClassifications
 */

/**
 * Retrieves the classification data for the currently selected classification type
 * @param {State} state - The application state
 * @returns {Array<FilteredStageResult|FilteredClassifications>} The classification data
 * @throws {StateNotInitializedError} If the state is not initialized.
 * @throws {StatePropertyNotDefinedError} If a required property is not defined in `state.selected`.
 * @throws {StatePropertyNotSetError} If a required property is not set (null or undefined).
 * @throws {StatePropertyValueNotValidError} If the classification value is not valid.
 * @throws {SelectionClassificationNotDefinedError} When classification processing fails
 */
export function selectedClassificationsRankings(state) {
  stateCheckSelected(state, { stage: true, classification: true });
  const selectedStage = state.selected.stage;
  const selectedClassification = state.selected.classification;

  const { results, classifications } = state.sportData;

  // Stage Results
  if (selectedClassification === CLASSIFICATION_TYPES.STAGE) {
    return results.map((rider) => {
      return !rider ? null : rider.slice(0, selectedStage + 1);
    });
  }

  // Classifications Rankings
  if (Object.hasOwn(classifications, selectedClassification)) {
    return classifications[selectedClassification].map((rider) => {
      return !rider ? null : rider.slice(0, selectedStage + 1);
    });
  }

  throw new SelectionClassificationNotDefinedError(selectedClassification);
}

/**
 * Checks if all elements in an array up to (but not including) a given index are null or undefined.
 * @param {FilteredClassifications} classification - The array to check.
 * @returns {boolean} True if all elements up to the index are empty, false otherwise.
 */
export function isCompetingIn(classification) {
  if (!Array.isArray(classification)) {
    return null;
  }

  return classification.some((item) => item != null);
}
