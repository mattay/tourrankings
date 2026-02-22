const PATTERN_TEAM = /^(?<teamName>.*) \((?<teamClassification>.*)\)$/;
const PATTERN_NAME =
  /^(?<surname>[A-Z\u00C0-\u00FF]+(?: [A-Z\u00C0-\u00FF]+)*)\s+(?<firstNames>.+)$/u;

/** @typedef {Object} ParseTeamNameResult
 * @property {boolean} success - Indicates whether the parsing was successful.
 * @property {Object} values - An object containing the parsed team name and classification.
 * @property {string} values.teamName - The parsed team name.
 * @property {string} values.teamClassification - The parsed team classification.
 */

/** @typedef {Object} ParseNameResult
 * @property {boolean} success - Indicates whether the parsing was successful.
 * @property {Object} values - An object containing the parsed surname and first names.
 * @property {string} values.surname - The parsed surname.
 * @property {string} values.firstNames - The parsed first names.
 */

/**
 * Parses a team name and classification from a string.
 *
 * @param {string} teamName - The team name and classification string.
 * @returns {ParseTeamNameResult} An object containing the parsed team name and classification.
 */
export function parseTeamName(teamName) {
  const match = teamName?.match(PATTERN_TEAM) || false;

  return {
    success: !!match,
    values: {
      teamName: match?.groups?.teamName || null,
      teamClassification: match?.groups?.teamClassification || null,
    },
  };
}

/**
 * Parses a name string into surname and first names.
 *
 * @param {string} name - The name string to parse.
 * @returns {ParseNameResult} An object containing the parsed surname and first names.
 */
export function parseName(name) {
  const match = name?.match(PATTERN_NAME) || false;

  return {
    success: !!match,
    values: {
      surname: match?.groups?.surname || null,
      firstNames: match?.groups?.firstNames || null,
    },
  };
}
