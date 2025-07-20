import { stateCheckSelected } from "../../store/stateCheck";
import { selectedClassificationsRankings } from "./utils/classifications";

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

  // Throws an error if any of the selected properties are not valid
  stateCheckSelected(state, { stage: true, classification: true });
  const riderRankings = selectedClassificationsRankings(state);
  const rankings = Array.from(riderRankings.values());

  return rankings.reduce((results, ranking) => {
    if (!ranking.some((item) => item != null)) {
      return results;
    }
    results.push(ranking.filter((item) => item != null));

    return results;
  }, []);
}
