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
  race: (raceCode, year) => `${raceCode}:${year}`,

  /**
   * Generate a stage ID.
   * @param {string|number} racePcsID - PCS race identifier.
   * @param {number|string} stageNumber - Stage number.
   * @returns {string} Composite stage ID.
   */
  stage: (racePcsID, stageNumber) => `${racePcsID}:${stageNumber}`,

  /**
   * Generate a result ID.
   * @param {string} stageId - Stage identifier.
   * @param {string|number} riderId - Rider identifier.
   * @returns {string} Composite result ID.
   */
  result: (stageId, riderId) => `${stageId}:${riderId}`,
};
