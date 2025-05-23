/**
 * @typedef {import('../../store/store.d').State} State
 */

/**
 *
 * @param {State} state -
 * @returns {Object}
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
