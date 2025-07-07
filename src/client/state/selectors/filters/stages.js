/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('../@types/stage').FilteredStage } FilteredStage
 */

import { validateStage } from "src/core/cycling/stage/stage";

/**
 *
 * @param {State} state -
 * @returns {Array<FilteredStage>}
 */
export function raceStages(state) {
  if (!state.sportData || validateStage(state.selected.stage) === null)
    return null;

  return state.sportData.stages.reduce((results, stage) => {
    // We need to drop any empty stages
    if (stage) {
      stage.viewing = stage.stage <= state.selected.stage;
      results.push(stage);
    }
    return results;
  }, []);
}
