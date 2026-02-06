/**
 * @typedef {import('../../../../server/controllers/@types/raceContent').Race } Race
 * @typedef {import('./stage').RaceStageData} Stage
 * @typedef {import('./rider').Rider} Rider
 * @typedef {import('./team').Team} Team
 * @typedef {import('./stageResult').RiderStageResults}
 */

/**
 * @typedef {Object} RaceData
 * @property {Race} race - Race metadata
 * @property {Stage[]} stages - List of stage objects
 * @property {number} stagesCompleted - Viewing stage identifier
 * @property {Map<string, Rider>} riders - Map of rider ID to Rider object
 * @property {Map<string, Team>} teams - Map of team ID to Team object
 * @property {Rider} results - Array of cleaned rider result object
 */

export {};
