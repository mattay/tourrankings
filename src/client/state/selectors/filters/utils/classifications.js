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
 * @returns {Map<number|string, FilteredStageResult|FilteredClassifications>} The classification data
 * @throws {StateNotInitializedError} If the state is not initialized.
 * @throws {StatePropertyNotDefinedError} If a required property is not defined in `state.selected`.
 * @throws {StatePropertyNotSetError} If a required property is not set (null or undefined).
 * @throws {StatePropertyValueNotValidError} If the classification value is not valid.
 * @throws {SelectionClassificationNotDefinedError} When classification processing fails
 */
export function selectedClassificationsRankings(state) {
  stateCheckSelected(state, { stage: true, classification: true });
  stateCheckSelected(state, { stage: true, classification: true });

  const { stage: selectedStage, classification: selectedClassification } =
    state.selected;
  const { results, classifications } = state.sportData;

  // Determine which data source to use based on classification type
  const rankingsData = getRankingsDataSource(
    selectedClassification,
    results,
    classifications,
  );

  // Transform data to include only rankings up to selected stage
  return createStageFilteredRankings(rankingsData, selectedStage);
}

/**
 * Gets the appropriate data source for the selected classification
 * @param {string} selectedClassification - The classification type
 * @param {Map} results - Stage results data
 * @param {Map} classifications - Classification data by type
 * @returns {Map} The appropriate rankings data source
 * @throws {SelectionClassificationNotDefinedError} When classification doesn't exist
 */
function getRankingsDataSource(
  selectedClassification,
  results,
  classifications,
) {
  if (selectedClassification === CLASSIFICATION_TYPES.STAGE) {
    return results;
  }

  if (classifications.has(selectedClassification)) {
    return classifications.get(selectedClassification);
  }

  throw new SelectionClassificationNotDefinedError(selectedClassification);
}

/**
 * Creates a new map with rider data filtered to selected stage
 * @param {Map} rankingsData - Source rankings data
 * @param {number} selectedStage - Stage number to filter up to
 * @returns {Map<string, Array|null>} Filtered rankings map
 */
function createStageFilteredRankings(rankingsData, selectedStage) {
  return new Map(
    Array.from(rankingsData.entries()).map(([riderId, riderData]) => [
      riderId,
      riderData ? riderData.slice(0, selectedStage + 1) : null,
    ]),
  );
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
