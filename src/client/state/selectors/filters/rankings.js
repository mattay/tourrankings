import {
  CLASSIFICATION_TYPES,
  isValidClassificationType,
} from "src/core/cycling/classification/classification";

/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('../@types/result').FilteredStageResult} FilteredStageResult
 * @typedef {import('../@types/classifications').FilteredClassifications} FilteredClassifications
 */

/**
 *
 * @param {State} state -
 * @returns {Array<FilteredStageResult|FilteredClassifications>|null}
 */
export function rankings(state) {
  if (
    !state.raceData ||
    state.selected.stage === null ||
    !isValidClassificationType(state.selected.classification)
  ) {
    return null;
  }

  let riderRankings = [];

  if (state.selected.classification === CLASSIFICATION_TYPES.STAGE) {
    riderRankings = state.raceData.results;
  } else if (
    Object.hasOwn(state.raceData.classifications, state.selected.classification)
  ) {
    riderRankings =
      state.raceData.classifications[state.selected.classification];
  } else {
    console.warn(
      `Unhandled classification type in selector: ${state.selected.classification}`,
    );
  }

  return riderRankings.map((rider) => {
    return !rider ? rider : rider.slice(0, state.selected.stage + 1);
  });
}
