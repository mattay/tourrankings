import { stateCheckSelected } from "../../store/stateCheck";
import { selectedClassifications } from "./utils/classifications";

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
  if (!state.sportData) {
    return null;
  }

  // Throw an error if any of the selected properties are not valid
  stateCheckSelected(state, { stage: true, classification: true });
  const riderRankings = selectedClassifications(state);

  return riderRankings.map((rider) => {
    return !rider ? rider : rider.slice(0, state.selected.stage + 1);
  });
}
