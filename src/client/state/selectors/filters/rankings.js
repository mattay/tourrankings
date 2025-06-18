import {
  CLASSIFICATION_TYPES,
  isValidClassificationType,
} from "src/core/cycling/classification/classification";

/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('../@types/result').FilteredStageResult} FilteredStageResult
 */

/**
 *
 * @param {State} state -
 * @returns {Array<FilteredStageResult>}
 */
export function rankings(state) {
  if (
    !state.raceData ||
    !state.currentStage ||
    !isValidClassificationType(state.currentClassification)
  ) {
    return null;
  }

  let riderRankings = [];

  if (state.currentClassification === CLASSIFICATION_TYPES.STAGE) {
    riderRankings = state.raceData.results;
  } else if (
    Object.hasOwn(state.raceData.classifications, state.currentClassification)
  ) {
    riderRankings = state.raceData.classifications[state.currentClassification];
  } else {
    console.warn(
      `Unhandled classification type in selector: ${state.currentClassification}`,
    );
  }

  return riderRankings.map((rider) => {
    return !rider ? rider : rider.slice(0, state.currentStage + 1);
  });
}
