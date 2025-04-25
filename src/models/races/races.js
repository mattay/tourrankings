import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceData
 * @property {string} year - The year of the race.
 * @property {string} startDate - The start date of the race.
 * @property {string} endDate - The end date of the race.
 * @property {string} raceClass - The class of the race.
 * @property {string} raceId - The unique identifier of the race.
 * @property {string} raceName - The name of the race.
 * @property {string} raceUrlId - The URL identifier of the race.
 * @property {string} raceUrl - The URL of the race.
 */

/**
 * Races model class
 */
class Races extends CSVdataModel {
  constructor() {
    super("data/raw/csv/races_data.csv", ["raceId"]);
    this.csvHeaders = [
      "Year",
      "Start Date",
      "End Date",
      "Race Class",
      "Race Id",
      "Race Name",
      "Race Url Id",
      "Race Url",
    ];
  }

  /**
   * Sort the rows by start date.
   * overrides sortRows method from CSVdataModel
   */
  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }

  /**
   * Get all races for a given season.
   * @param {number} year - The year of the season.
   * @returns {Array<RaceData>} - An array of race data objects.
   */
  season(year) {
    return this.rows.filter((record) => Number(record.year) === Number(year));
  }

  /**
   * Get all races that have already happened.
   * @param {number} year - The year of the season.
   * @returns {Array<RaceData>} - An array of race data objects.
   */
  past(year = null) {
    const today = new Date();

    return this.rows.filter((record) => {
      const raceEndDate = new Date(record.endDate);
      if (year && Number(record.year) !== Number(year)) {
        return false;
      }
      return today >= raceEndDate;
    });
  }

  /**
   * Get all races currently in progress.
   * @param {Date} date - The date to check against.
   * @returns {Array<RaceData>} - An array of race data objects.
   */
  inProgress(date) {
    // const today = new Date();
    return this.rows.filter((record) => {
      const raceStartDate = new Date(record.startDate);
      const raceEndDate = new Date(record.endDate);
      return date >= raceStartDate && date <= raceEndDate;
    });
  }

  /**
   * Get all races that are upcoming.
   * @returns {Array<RaceData>} - An array of race data objects.
   */
  upcoming() {
    const today = new Date();

    return this.rows.filter((record) => {
      const raceStartDate = new Date(record.startDate);
      return today <= raceStartDate;
    });
  }

  /**
   * Get all races in a given year.
   * @param {number} year - The year of the races.
   * @returns {Array<RaceData>} - An array of race data objects.
   */
  racesInYear(year) {
    return this.rows.filter((record) => {
      return Number(record.year) == year;
    });
  }
}

export default Races;
