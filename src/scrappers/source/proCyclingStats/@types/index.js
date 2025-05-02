/**
 * @typedef {Object} ScrapedRace
 * @property {string} raceUID - The unique identifier for the race (raceId:year)
 * @property {number} year - The year of the race
 * @property {string} startDate - The start date of the race in YYYY-MM-DD format
 * @property {string} endDate - The end date of the race in YYYY-MM-DD format
 * @property {string} raceName - The name of the race
 * @property {string} raceClass - The classification of the race
 * @property {string} racePcsID - The cleaned URL of the race page
 * @property {string} racePcsUrl - The cleaned URL of the race page
 */

/**
 * @typedef {Object} ScrapedRaceStage
 * @property {string} raceUID - The unique identifier for the race (raceId:year)
 * @property {string} stageUID - The unique identifier for the stage (raceId:year:stageId)
 * @property {number} year - The year of the race
 * @property {string} date - The date of the stage in YYYY-MM-DD format
 * @property {number} stage - The property of the stage
 * @property {string} stageType - The type of the stage
 * @property {string} parcoursType - The type of the stage
 * @property {string} departure - The departure location of the stage
 * @property {string} arrival - The arrival location of the stage
 * @property {number} distance - The distance of the stage in kilometers
 * @property {number} verticalMeters - The elevation of the stage in meters
 * @property {string} stagePcsUrl - The cleaned URL of the stage page
 */

/**
 * Represents a rider in the race startlist.
 *
 * @typedef {Object} ScrapedRaceStartListRider - Represents a rider in the startlist.
 * @property {number} year - The year of the race.
 * @property {number} bib - The bib number of the rider.
 * @property {string} rider - The name of the rider.
 * @property {string} flag - The flag of the rider's country.
 * @property {string} riderPcsId - The ID of the rider on ProcyclingStats.
 * @property {string} riderPcsUrl - The URL of the rider on ProcyclingStats.
 */

/**
 * Represents a team in the race startlist, including team details and its riders.
 *
 * @typedef {Object} ScrapedRaceStartListTeam - Represents a team in the startlist.
 * @prop {number} year - The year of the race.
 * @prop {string} teamName - The name of the team.
 * @prop {string} teamPcsUrl - The URL of the team on ProcyclingStats.
 * @prop {string} jerseyImageUrl - The URL of the team's jersey image.
 * @prop {string} teamPcsId - The ID of the team on ProcyclingStats.
 * @prop {string} teamClassification - The classification of the team.
 * @prop {Array<ScrapedRaceStartListRider>} riders - An array of riders in the team.
 *
 * @see ScrapedRaceStartListRider
 */
