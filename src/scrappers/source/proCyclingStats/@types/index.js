/**
 * @typedef {Object} ScrapedRace
 * @property {String} raceUID - The unique identifier for the race (raceId:year)
 * @property {Number} year - The year of the race
 * @property {String} startDate - The start date of the race in YYYY-MM-DD format
 * @property {String} endDate - The end date of the race in YYYY-MM-DD format
 * @property {String} raceName - The name of the race
 * @property {String} raceClass - The classification of the race
 * @property {String} racePcsID - The cleaned URL of the race page
 * @property {String} racePcsUrl - The cleaned URL of the race page
 */

/**
 * @typedef {Object} ScrapedRaceStage
 * @property {String} raceUID - The unique identifier for the race (raceId:year)
 * @property {String} stageUID - The unique identifier for the stage (raceId:year:stageId)
 * @property {Number} year - The year of the race
 * @property {String} date - The date of the stage in YYYY-MM-DD format
 * @property {Number} stage - The property of the stage
 * @property {String} stageType - The type of the stage
 * @property {String} parcoursType - The type of the stage
 * @property {String} departure - The departure location of the stage
 * @property {String} arrival - The arrival location of the stage
 * @property {Number} distance - The distance of the stage in kilometers
 * @property {Number} verticalMeters - The elevation of the stage in meters
 * @property {String} stagePcsUrl - The cleaned URL of the stage page
 */

/**
 * Represents a rider in the race startlist.
 *
 * @typedef {Object} ScrapedRaceStartListRider - Represents a rider in the startlist.
 * @property {Number} year - The year of the race.
 * @property {Number} bib - The bib Number of the rider.
 * @property {String} rider - The name of the rider.
 * @property {String} flag - The flag of the rider's country.
 * @property {String} riderPcsId - The ID of the rider on ProcyclingStats.
 * @property {String} riderPcsUrl - The URL of the rider on ProcyclingStats.
 */

/**
 * Represents a team in the race startlist, including team details and its riders.
 *
 * @typedef {Object} ScrapedRaceStartListTeam - Represents a team in the startlist.
 * @property {Number} year - The year of the race.
 * @property {String} teamName - The name of the team.
 * @property {String} teamPcsUrl - The URL of the team on ProcyclingStats.
 * @property {String} jerseyImageUrl - The URL of the team's jersey image.
 * @property {String} teamPcsId - The ID of the team on ProcyclingStats.
 * @property {String} teamClassification - The classification of the team.
 * @property {ScrapedRaceStartListRider[]} riders - An array of riders in the team.
 *
 * @see ScrapedRaceStartListRider
 */

export {};
