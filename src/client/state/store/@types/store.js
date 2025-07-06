/**
 * @typedef {import('../../../domain/cycling/parse/raceContent/@types/raceContent').RaceContent} RaceContent
 */

/**
 * @typedef {Object} Selected
 * @property {?string} raceId - The current race identifier.
 * @property {?number} year - The current year.
 * @property {?number} stage - The current stage identifier.
 * @property {?string} classification - The current ranking view.
 */

/**
 * @typedef {Object} State
 * @property {?string} sport - The sport identifier.
 * @property {?RaceContent} sportData - Data related to the race.
 * @property {Selected} previouslySelected - Previously selected data.
 * @property {Selected} selected - Selected data.
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
