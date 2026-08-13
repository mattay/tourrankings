/**
 * @typedef {import('../../../domain/cycling/parse/raceContent/@types/raceContent').RaceContent} RaceContent
 */

/**
 * @typedef {Object} Selected
 * @property {?string} raceId - The current race identifier.
 * @property {?number} year - The current year.
 * @property {?number} stage - The current stage identifier.
 * @property {?string} classification - The current ranking view.
 *
 * @typedef {Object} Label
 * @property {number} [maxChars] - Maximum character length for text labels.
 * @property {number} [maxValue] - Maximum numeric value (used to estimate rendered width).
 * @property {number} [characterWidth] - Rendered width of the label in pixels.
 *
 * @typedef {Object} Labels
 * @property {Label} name - Rider/team name label metrics.
 * @property {Label} bib - Bib number label metrics.
 * @property {Label} rank - Rank label metrics.
 * @property {Label} time - Time label metrics.
 * @property {Label} points - Points label metrics.
 */

/**
 * @typedef {Object} State
 * @property {?string} sport - The sport identifier.
 * @property {?RaceContent} sportData - Data related to the race.
 * @property {Selected} previouslySelected - Previously selected data.
 * @property {Selected} selected - Selected data.
 * @property {Labels} labels - label characteristics
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
