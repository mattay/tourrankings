/**
 * @typedef {object} RawRider -
 * @property {string} bib - The bib number of the rider.
 * @property {string} rider - The name of the rider.
 * @property {string} teamId - The unique identifier of the team.
 * @property {string} flag - The flag of the rider's country.
 * @property {string} id - Unique identifier for the rider
 */

/**
 * @typedef {{ [riderBib: number]: RawRider }} RawRaceRiders
 */

/**
 * @typedef {object} Rider -
 * @property {number} bib - The bib number of the rider.
 * @property {string} rider - The name of the rider.
 * @property {string} teamId - The unique identifier of the team.
 * @property {string} flag - The flag of the rider's country.
 * @property {string} id - Unique identifier for the rider
 * @property {Team} team -
 */

/**
 * @typedef {Map<number, Rider>} RaceRiders
 */
