/** @typedef {Object} RawTeam
 * @property {string} id - The unique identifier for the team.
 * @property {string} name - The name of the team.
 * @property {string} classification - The classification of the team.
 * @property {string} jerseyImage - The URL of the team's jersey image.
 * @property {Array} riders -
 */

/**
 * @typedef {{ [teamId: string]: RawTeam }} RawRaceTeams
 */

/** @typedef {Object} Team
 * @property {string} id - The unique identifier for the team.
 * @property {string} name - The name of the team.
 * @property {string} classification - The classification of the team.
 * @property {string} jerseyImage - The URL of the team's jersey image.
 * @property {Rider[]} riders - list of riders in the team
 */

/**
 * @typedef {Map<string, Team>} RaceTeams
 */
