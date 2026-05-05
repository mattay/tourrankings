import { validateYear } from "@utils/date";

let _season;

/**
 * Get the current race season year.
 * Can pass a year to override, or will check SEASON env var,
 * then default to current year.
 * @param {number} [year] - Optional year override
 * @returns {number} The race season year
 */
export function getSeason(year) {
  // If year is explicitly passed, reset cache and return that year
  if (year !== undefined) {
    _season = undefined;
    return validateYear(year, new Date().getFullYear());
  }

  // Use cache only when no year parameter
  if (_season !== undefined) return _season;
  const today = new Date();
  let raceSeason = today.getFullYear();

  if (process.env.SEASON) {
    raceSeason = validateYear(process.env.SEASON, raceSeason);
  }

  _season = raceSeason;
  return raceSeason;
}
