/**
 * @typedef {import('./teams.d').RawTeam} RawTeam
 * @typedef {import('./teams.d').Team} Team
 */

/**
 * Parses a raw team object into a Team object.
 * Converts the riders array from raw riders to parsed riders.
 * @param {RawTeam} rawTeam - The raw team data to parse.
 * @returns {Team} The parsed team object.
 */
export function parseTeam(rawTeam) {
  return {
    ...rawTeam,
  };
}
