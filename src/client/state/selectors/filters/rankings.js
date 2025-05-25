/**
 * @typedef {import('../../store/store.d').State} State
 */

/**
 *
 * @param {State} state -
 * @returns {Object}
 */
export function rankings(state) {
  if (!state.raceData || !state.currentStage) return null;

  switch (state.currentRanking) {
    case "results":
      return state.raceData.results.map((rider) => {
        return !rider ? rider : rider.slice(0, state.currentStage + 1);
      });
    default:
      return [];
  }
}
