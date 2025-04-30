import CSVdataModel from "../dataModel_csv.js";
import { logOut } from "src/utils/logging.js";

/**
 * @typedef {Object} RaceData
 * @property {string} raceUID - The unique identifier of the race.
 * @property {string} year - The year of the race.
 * @property {string} startDate - The start date of the race.
 * @property {string} endDate - The end date of the race.
 * @property {string} raceClass - The class of the race.
 * @property {string} raceName - The name of the race.
 * @property {string} racePcsID - The URL identifier of the race.
 * @property {string} racePcsUrl - The URL of the race.
 */

/**
 * @class Races
 * @extends CSVdataModel
 * @description Represents the races data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class Races extends CSVdataModel {
  constructor() {
    super("data/raw/csv/races.csv", ["Race UID"]);
    this.csvHeaders = [
      "Race UID",
      "Year",
      "Start Date",
      "End Date",
      "Race Class",
      "Race Name",
      "Race Pcs ID",
      "Race Pcs Url",
    ];
  }

  /**
   * Sort the rows by start date.
   * overrides sortRows method from CSVdataModel
   * @returns {void}
   */
  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
  }

  /**
   * Get a race by its unique identifier.
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {RaceData|null} - The race data object or null if not found.
   */
  raceUID(raceUID) {
    logOut(this.constructor.name, `raceUID(${raceUID})`, "debug");
    return this.rows.find((race) => race.raceUID === raceUID);
  }

  /**
   * Get a race by its unique identifier and year.
   * @param {string} racePcsID - The unique identifier of the race.
   * @param {number} year - The year of the race.
   * @returns {RaceData|null} - The race data object or null if not found.
   */
  racePcsID(racePcsID, year) {
    logOut(this.constructor.name, `racePcsID(${racePcsID}, ${year})`, "debug");
    return this.rows.find((race) => {
      console.log(race.racePcsID, race.year);
      return race.racePcsID === racePcsID && Number(race.year) === Number(year);
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

  /**
   * Get a specific race by ID and year.
   * @param {string} id - The ID of the race.
   * @param {string} key [raceUID|racePcsID] - The key to identify the race.
   * @param {number} year - The year of the race.
   * @returns {RaceData|null} - The race data object or null if not found.
   */
  race(raceID, key = "raceUID", year) {
    for (const record of this.rows) {
      if (record[key] === raceID && Number(record.year) === Number(year)) {
        return record;
      }
    }
    return null;
  }
}
