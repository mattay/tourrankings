/**
 * @typedef {import("../../../src/services/dataServiceInstance").RaceData} RaceData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceStageData} RaceStageData
 * @typedef {import("../../../src/services/dataServiceInstance.js").RaceStageRiderResultData} RaceStageRiderResultData
 *
 * @typedef {RaceData} Race
 * @typedef {RaceStageData & {raced: boolean}} RaceStage
 * @typedef {RaceStageRiderResultData} RaceStageRiderResult
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
 * @typedef {{ [riderBib: number]: RaceRider }} Riders
 * Riders indexed by rider bib number.
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
 * @typedef {{ [teamId: string]: RaceTeam }} Teams
 * Teams indexed by team ID.
 */

/**
 * @typedef {Array<RaceStageRiderResult[]>} StagesRiderResults
 *   StagesRiderResults[stageNumber][riderBib] = RaceStageRiderResult
 */

/**
 * @typedef {Array<RaceStageRiderResult[]>} RidersStageResults
 *   RidersStageResults[riderBib][stageNumber] = RaceStageRiderResult
 */

/**
 * @typedef {Object} RaceContent
 * @property {Race} race - The race details.
 * @property {RaceStage[]} stages - The race stages.
 * @property {Number} stagesCompleted - The stage being viewed.
 * @property {Teams} teams - Teams indexed by team ID.
 * @property {Riders} riders - Riders indexed by bib number.
 * @property {RidersStageResults} results - Indexed by rider bib number.
 */

export {};
