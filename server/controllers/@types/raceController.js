/**
 * Data Models
 * @typedef {import("../../../src/services/dataServiceInstance").RaceData} RaceData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceStageData} RaceStageData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceRiderData} RaceRiderData
 * @typedef {import("../../../src/services/dataServiceInstance").TeamData} TeamData
 * @typedef {import("../../../src/services/dataServiceInstance").RaceStageRiderResultData} RaceStageResultData
 * @typedef {import("../../../src/services/dataServiceInstance").ClassificationPointsData} ClassificationPoints
 * @typedef {import("../../../src/services/dataServiceInstance").ClassificationMountainData} ClassificationMountain
 * @typedef {import("../../../src/services/dataServiceInstance").ClassificationGeneralData} ClassificationGeneral
 * @typedef {import("../../../src/services/dataServiceInstance").ClassificationYouthData} ClassificationYouth
 * @typedef {import("../../../src/services/dataServiceInstance").ClassificationTeamData} ClassificationTeam

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
 * Represents all classification results for a race, grouped by type and stage.
 * Each property is an array of arrays, where each inner array contains results for a stage.
 * @typedef {Object} RaceClassifications
 * @property {ClassificationGeneral[][]} gc - General classification results per stage.
 * @property {ClassificationYouth[][]} youth - Youth classification results per stage.
 * @property {ClassificationPoints[][]} points - Points classification results per stage.
 * @property {ClassificationMountain[][]} mountain - Mountain classification results per stage.
 * @property {ClassificationTeam[][]} team - Team classification results per stage.
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
