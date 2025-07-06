/**
 * @typedef {Object} UrlPathRace
 * @property {string} root - The root segment of the URL path (e.g., "races").
 * @property {string} raceId - The unique identifier for the race.
 * @property {number} year - The year of the race. Defaults to the current year if not specified in the URL.
 * @property {?number} stage - The stage number of the race, or null if not present in the URL.
 * @property {?string} classification - The classification type, or null if not present in the URL.
 */

/**
 * Extracts race information from the current URL path.
 *
 * Parses the window location's pathname and returns an object containing
 * the root, raceId, year, stage, and classification. If year, stage, or classification
 * are missing from the URL, defaults are provided as follows:
 *   - year: current year
 *   - stage: null
 *   - classification: null
 *
 * @returns {UrlPathRace} An object containing race information parsed from the URL.
 *
 * @example
 * // For URL: /races/tour-de-france/2025/3/points
 * getRaceInfoFromUrlPath();
 * // Returns:
 * // {
 * //   root: "races",
 * //   raceId: "tour-de-france",
 * //   year: 2025,
 * //   stage: 3,
 * //   classification: "points"
 * // }
 */
export function getRaceInfoFromUrlPath() {
  const pathParts = window.location.pathname.split("/").filter((part) => part);

  const root = pathParts[0];
  const raceId = pathParts[1];
  const year =
    pathParts.length > 2 ? parseInt(pathParts[2]) : new Date().getFullYear();
  const stage = pathParts.length > 3 ? parseInt(pathParts[3]) : null;
  const classification = pathParts.length > 4 ? pathParts[4] : null;

  return {
    root,
    raceId,
    year,
    stage,
    classification,
  };
}
