/**
 * Utilities for generating stable IDs for races, stages and results.
 * @namespace generateId
 */
export const generateId = {
  /**
   * Generate a race ID.
   * @param {string} raceCode - Short code for the race.
   * @param {number|string} year - Race year.
   * @returns {string} Composite race ID.
   */
  race: (raceCode, year) => {
    if (!raceCode || !year)
      throw new Error(
        `generateId.race: invalid args (raceCode=${raceCode}, year=${year})`,
      );
    return `${raceCode}:${year}`;
  },

  /**
   * Generate a stage ID.
   * @param {string} raceUID - Composite race UID (as returned by generateId.race).
   * @param {number|string} stageNumber - Stage number.
   * @returns {string} Composite stage ID.
   */
  stage: (raceUID, stageNumber) => {
    if (!raceUID || stageNumber == null)
      throw new Error(
        `generateId.stage: invalid args (raceUID=${raceUID}, stageNumber=${stageNumber})`,
      );
    return `${raceUID}:${stageNumber}`;
  },
};
