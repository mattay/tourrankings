/**
 * @typedef {import('../../../utils/parse/raceContent/@types/raceContent').RaceContent} RaceContent
 */

// /**
//  * @typedef {Object} RaceData
//  * @property {Object} race -
//  * @property {Array<Object>} stages -
//  * @property {number} stagesCompleted -
//  * @property {Map<Object>} teams -
//  * @property {Map<Object>} riders -
//  * @property {Array<Object>} results -
//  */

/**
 * @typedef {Object} State
 * @property {?RaceContent} raceData - Data related to the race.
 * @property {?string} currentRaceId - The current race identifier.
 * @property {?number} currentYear - The current year.
 * @property {?number} currentStage - The current stage identifier.
 * @property {?string} currentClassification - The current ranking view.
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
