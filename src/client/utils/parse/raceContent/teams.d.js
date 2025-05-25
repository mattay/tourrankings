/**
 * @typedef {Object} RawTeam
 * @property {string} id - The unique identifier for the team.
 * @property {string} name - The name of the team.
 * @property {string} classification - The classification of the team.
 * @property {string} jerseyImage - The URL of the team's jersey image.
 * @property {Array} riders - Array of riders (type not specified).
 */

/**
 * @typedef {{ [teamId: string]: RawTeam }} RawRaceTeams
 *   An object mapping team IDs to RawTeam objects.
 */

/**
 * @typedef {import('./riders.d').Rider} Rider
 */

/**
 * @typedef {Object} Team
 * @property {string} id - The unique identifier for the team.
 * @property {string} name - The name of the team.
 * @property {string} classification - The classification of the team.
 * @property {string} jerseyImage - The URL of the team's jersey image.
 * @property {Rider[]} riders - List of riders in the team.
 */

/**
 * @typedef {Map<string, Team>} RaceTeams
 *   A Map of team IDs to Team objects.
 */

export {};
