import { CLASSIFICATION_TYPES } from "src/core/cycling/classification/classification";

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
  if (!state.raceData || !state.currentStage) return null;

  switch (state.currentClassification) {
    case CLASSIFICATION_TYPES.STAGE:
      return state.raceData.results.map((rider) => {
        return !rider ? rider : rider.slice(0, state.currentStage + 1);
      });
    default:
      console.warn(
        `Unhandled classification type in selector: ${state.currentClassification}`,
      );
      return [];
  }
}
