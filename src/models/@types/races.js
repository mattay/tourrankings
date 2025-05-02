/**
 * @typedef {Object} RaceModel
 * @property {string} raceUID - The unique identifier of the race.
 * @property {string} year - The year of the race.
 * @property {string} startDate - The start date of the race.
 * @property {string} endDate - The end date of the race.
 * @property {string} raceClass - The class of the race.
 * @property {string} raceName - The name of the race.
 * @property {string} racePcsID - The URL identifier of the race.
 * @property {string} racePcsUrl - The URL of the race.
 */

/**
 * @typedef {Object} RaceStageModel
 * @property {string} stageUID - The unique identifier for the stage.
 * @property {string} raceUID - The unique identifier for the race (matches RaceData.raceId).
 * @property {number} year - The year of the stage.
 * @property {string} date - The date of the stage.
 * @property {number} stage - The stage number.
 * @property {string} stageType - The type of the stage.
 * @property {string} parcoursType - The type of the parcours.
 * @property {string} departure - The departure location of the stage.
 * @property {string} arrival - The arrival location of the stage.
 * @property {number} distance - The distance of the stage in kilometers.
 * @property {number} verticalMeters - The vertical meters of the stage.
 */

/**
 * @typedef {Object} RaceStageLocationPointModel
 * @property {number} locationID - The unique identifier for the location.
 * @property {number} stageId - The unique identifier for the stage.
 * @property {number} year - The year of the race.
 * @property {number} stage - The stage number.
 * @property {string} type - The type of the stage.
 * @property {string} locationName - The name of the location.
 * @property {number} distance - The distance of the stage.
 */

/**
 * @typedef {Object} RaceStageLocationMountainModel
 * @property {string} locationId - Unique identifier for the location.
 * @property {string} stageId - Unique identifier for the stage.
 * @property {string} year - Year of the race.
 * @property {string} stage - Name of the stage.
 * @property {string} type - Type of the stage.
 * @property {string} locationName - Name of the location.
 * @property {string} distance
 */

/**
 * @typedef {Object} RaceStageResultModel
 * @property {string} stageUID - The unique identifier for the stage RaceStageModel.stageId.
 * @property {number} stage - The stage number.
 * @property {number} rank - The rank of the rider in the stage.
 * @property {number} gc - The General Classification points earned by the rider.
 * @property {string} timelag - The time difference between the rider's time and the winner's time.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 * @property {string} uci - The UCI classification of the rider.
 * @property {number} points - The points earned by the rider in the stage.
 * @property {number} bonuses - The bonuses earned by the rider in the stage.
 * @property {string} time - The time taken by the rider to complete the stage.
 * @property {string} delta - The time difference between the rider's time and the winner's time.
 */

/** @typedef {Object} RaceRiderModel -
 * @property {string} raceUID - The unique identifier of the race.
 * @property {string} bib - The bib number of the rider.
 * @property {string} riderPcsId - The unique identifier of the rider.
 * @property {string} teamPcsId - The unique identifier of the team.
 * @property {string} rider - The name of the rider.
 * @property {string} flag - The flag of the rider's country.
 */

export {};
