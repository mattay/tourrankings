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
 * @typedef {Object} ScrapedRaceStartListRider - Represents a rider in the startlist.
 * @property {Number} year - The year of the race.
 * @property {String|null} pcsId - The ID of the rider on ProcyclingStats.
 * @property {String|null} pcsUrl - The URL of the rider on ProcyclingStats.
 * @property {Number|null} bib - The bib Number of the rider.
 * @property {String|null} surname - The surname of the rider.
 * @property {String|null} firstNames - The first names of the rider.
 * @property {String|null} flag - The flag of the rider's country.
 *
 * Represents a staff member in the race startlist.
 * @typedef {Object} ScrapedRaceStartListStaff - Represents a staff member in the startlist.
 * @property {Number} year - The year of the race.
 * @property {String|null} pcsId - The ID of the staff member on ProcyclingStats.
 * @property {String|null} pcsUrl - The URL of the staff member on ProcyclingStats.
 * @property {String|null} surname - The surname of the staff member.
 * @property {String|null} firstNames - The first names of the staff member.
 * @property {String|null} role - The role of the staff member.
 *
 * Represents a team in the race startlist, including team details and its riders.
 * @typedef {Object} ScrapedRaceStartListTeam - Represents a team in the startlist.
 * @property {Number} year - The year of the race.
 * @property {String|null} pcsId - The ID of the team on ProcyclingStats.
 * @property {String|null} pcsUrl - The URL of the team on ProcyclingStats.
 * @property {String|null} jerseyImageUrl - The URL of the team's jersey image.
 * @property {String|null} name - The name of the team.
 * @property {String|null} classification - The classification of the team.
 * @property {ScrapedRaceStartListRider[]} riders - An array of riders in the team.
 * @property {ScrapedRaceStartListStaff[]} staff - An array of staff members in the team.
 *
 * @see ScrapedRaceStartListRider
 */

export {};
