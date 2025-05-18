/**
 * @typedef {import("../../../src/services/dataServiceInstance").RaceData} RaceData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceStageData} RaceStageData
 * @typedef {import("../../../src/services/dataServiceInstance.js").RaceStageResultData} RaceStageResultData
 */

/**
 * @typedef {RaceData} Race
 * @typedef {RaceStageData & {raced: boolean}} RaceStage
 * @typedef {RaceStageResultData} RaceStageResult
 */

/**
 * @typedef {Object} RaceRider -
 * @property {number} bib - The rider's bib number.
 * @property {string} rider - The rider's name.
 * @property {string} teamId - The ID of the rider's team.
 * @property {string} id - The rider's ID.
 * @property {string} flag - The rider's flag.
 */

/**
 * @typedef {Object} RaceTeam
 * @property {string} id - The team's ID.
 * @property {string} name - The team's name.
 * @property {string} classification - The team's classification.
 * @property {string} jerseyImage - The team's jersey image URL.
 * @property {Array<RaceRider>} riders - The team's riders.
 */

/**
 * @typedef {Object} RaceContent
 * @property {Race} race - The race details.
 * @property {RaceStage[]} stages - The race stages.
 * @property {Number} stagesCompleted - The stage being viewed.
 * @property {Object<string, RaceTeam>} teams - Teams indexed by team ID.
 * @property {Object<string, RaceRider>} riders - Riders indexed by bib number.
 * @property {Array<RaceStageResult[]>} results - Indexed by rider bib number.
 */

export {};
