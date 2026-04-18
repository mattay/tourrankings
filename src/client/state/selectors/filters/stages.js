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
  if (!state.raceData || !state.currentStage) return null;

  return state.raceData.stages.reduce((results, stage) => {
    // We need to drop any empty stages
    if (stage) {
      stage.viewing = stage.stage <= state.currentStage;
      results.push(stage);
    }
    return results;
  }, []);
}
