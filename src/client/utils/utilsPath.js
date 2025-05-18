/**
 * @typedef {Object} UrlPathRace
 * @property {string} root -
 * @property {string} raceID -
 * @property {number} year -
 * @property {number} stage -
 * @property {string} ranking -
 */

/**
 * Extract race information from the current URL path
 * @returns {UrlPathRace} Object containing raceID, year, stage, and ranking
 */
export function getRaceInfoFromUrlPath() {
  const pathParts = window.location.pathname.split("/").filter((part) => part);

  const root = pathParts[0];
  const raceID = pathParts[1];
  const year =
    pathParts.length > 2 ? parseInt(pathParts[2]) : new Date().getFullYear();
  const stage = pathParts.length > 4 ? parseInt(pathParts[4]) : null;
  const ranking = pathParts.length > 5 ? pathParts[5] : null;

  return {
    root,
    raceID,
    year,
    stage,
    ranking,
  };
}
