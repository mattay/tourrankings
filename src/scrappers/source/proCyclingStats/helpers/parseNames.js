const PATTERN_TEAM = /^(?<name>.*) \((?<classification>.*)\)$/;
const PATTERN_NAME =
  /^(?<surname>[A-Z\u00C0-\u017F'/-]+(?: [A-Z\u00C0-\u017F'/-]+)*)\s+(?<firstNames>.+)$/u;

/** @typedef {Object} ParseTeamNameResult
 * @property {boolean} success - Indicates whether the parsing was successful.
 * @property {Object} values - An object containing the parsed team name and classification.
 * @property {string|null} values.name - The parsed team name.
 * @property {string|null} values.classification - The parsed team classification.
 */

/** @typedef {Object} ParseNameResult
 * @property {boolean} success - Indicates whether the parsing was successful.
 * @property {Object} values - An object containing the parsed surname and first names.
 * @property {string|null} values.surname - The parsed surname.
 * @property {string|null} values.firstNames - The parsed first names.
 */

/**
 * Parses a team name and classification from a string.
 *
 * @param {string|null|undefined} teamName - The team name and classification string.
 * @returns {ParseTeamNameResult} An object containing the parsed team name and classification.
 */
export function parseTeamName(teamName) {
  if (!teamName)
    return {
      success: false,
      values: { name: null, classification: null },
    };

  const match = teamName?.match(PATTERN_TEAM) || false;

  return {
    success: !!match,
    values: {
      name: match?.groups?.name || null,
      classification: match?.groups?.classification || null,
    },
  };
}

/**
 * Parses a name string into surname and first names.
 *
 * @param {string|null|undefined} name - The name string to parse.
 * @returns {ParseNameResult} An object containing the parsed surname and first names.
 */
export function parseName(name) {
  if (!name)
    return {
      success: false,
      values: { surname: null, firstNames: null },
    };

  const match = name?.match(PATTERN_NAME) || false;

  return {
    success: !!match,
    values: {
      surname: match?.groups?.surname || null,
      firstNames: match?.groups?.firstNames || null,
    },
  };
}
