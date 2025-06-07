/**
 * Data Models
 * @typedef {import("../../../src/services/dataServiceInstance").RaceData} RaceData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceStageData} RaceStageData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceRiderData} RaceRiderData
 * @typedef {import("../../../src/services/dataServiceInstance").TeamData} TeamData
 * @typedef {import("../../../src/services/dataServiceInstance.js").RaceStageRiderResultData} RaceStageResultData
 */

/**
 * Supports RaceContent
 * @typedef {RaceData} Race
 * @typedef {RaceStageData & {raced: boolean, viewing: boolean}} RaceStage
 * @typedef {Array<RaceStageResultData[]>} RaceResults
 */

/**
 * Supports RaceContent
 * @typedef {Object} RaceRider -
 * @property {number} bib - The rider's bib number.
 * @property {string} rider - The rider's name.
 * @property {string} teamId - The ID of the rider's team.
 * @property {string} id - The rider's ID.
 * @property {string} flag - The rider's flag.
 */

/**
 * Supports RaceContent
 * @typedef {Object} RaceTeam
 * @property {string} id - The team's ID.
 * @property {string} name - The team's name.
 * @property {string} classification - The team's classification.
 * @property {string} jerseyImage - The team's jersey image URL.
 * @property {RaceRider[]} riders - The team's riders.
 */

/**
 * Supports RaceContent
 * @typedef {Object} RaceClassifications
 * @property {Object[]} gc
 * @property {Object[]} youth
 * @property {Object[]} points
 * @property {Object[]} mountain
 * @property {Object[]} team
 */

/**
 * @typedef {Object} TemporalSeasonRaces
 * @property {RaceData[]} current - Races currently ongoing.
 * @property {RaceData[]} upcoming - Races yet to start.
 * @property {RaceData[]} previous - Races already completed.
 * @property {RaceData[]} future - Races scheduled for the future.
 */

/**
 * @typedef {Object} RaceContent
 * @property {Race} race - The race details.
 * @property {RaceStage[]} stages - The race stages.
 * @property {Number} stagesCompleted - The stage being viewed.
 * @property {Object<string, RaceTeam>} teams - Teams indexed by team ID.
 * @property {Object<string, RaceRider>} riders - Riders indexed by bib number.
 * @property {RaceResults} results - Indexed by rider bib number.
 * @property {RaceClassifications} classifications -
 */

export {};
