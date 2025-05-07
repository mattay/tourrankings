/**
 * Extract race information from the current URL path
 * @returns {Object} Object containing raceID, year, stage, and ranking
 */
export function getRacePathInfo() {
  const pathParts = window.location.pathname.split("/").filter((part) => part);

  const raceID = pathParts[1];
  const year =
    pathParts.length > 2 ? parseInt(pathParts[2]) : new Date().getFullYear();
  const stage = pathParts.length > 4 ? parseInt(pathParts[4]) : null;
  const ranking = pathParts.length > 5 ? pathParts[5] : null;

  return {
    raceID,
    year,
    stage,
    ranking,
  };
}
