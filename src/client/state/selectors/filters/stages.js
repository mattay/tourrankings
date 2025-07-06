/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('../@types/stage').FilteredStage } FilteredStage
 */

/**
 *
 * @param {State} state -
 * @returns {Array<FilteredStage>}
 */
export function raceStages(state) {
  if (!state.sportData || !state.selected.stage) return null;

  return state.sportData.stages.reduce((results, stage) => {
    // We need to drop any empty stages
    if (stage) {
      stage.viewing = stage.stage <= state.selected.stage;
      results.push(stage);
    }
    return results;
  }, []);
}
