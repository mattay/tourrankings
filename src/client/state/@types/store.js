/**
 * @typedef {Object} State
 * @property {?Object} raceData - Data related to the race.
 * @property {?string|number} currentRaceId - The current race identifier.
 * @property {?number} currentYear - The current year.
 * @property {?string|number} currentStage - The current stage identifier.
 * @property {boolean} isLoading - Loading state.
 * @property {?Error|string} error - Error information, if any.
 */

/**
 * @callback StateListener
 * @param {State} state
 * @returns {void}
 */

/**
 * @callback SelectorFunction
 * @param {State} state
 * @returns {any}
 */

export {};
