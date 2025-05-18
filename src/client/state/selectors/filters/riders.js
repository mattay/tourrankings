/**
 * @typedef {import('../../store/store.d').State} State
 */

/**
 *
 * @param {State} state -
 * @returns {Object}
 */
export function riders(state) {
  console.debug("[SELECTOR]", "riders");
  if (!state.raceData || !state.currentStage) return null;

  return Array.from(state.raceData.riders.values());
}
