import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageLocationPointsData
 * @property {number} locationID - The unique identifier for the location.
 * @property {number} stageId - The unique identifier for the stage.
 * @property {number} year - The year of the race.
 * @property {number} stage - The stage number.
 * @property {string} type - The type of the stage.
 * @property {string} locationName - The name of the location.
 * @property {number} distance - The distance of the stage.
 */

/**
 * @class RaceStageLocationPoints
 * @extends CSVdataModel
 * @description Represents the location points for each stage of a race.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceStageLocationPoints extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStageLocationPoints.csv", ["Location ID", "Bib"]);
    this.csvHeaders = [
      "Location ID",
      "Stage Id",
      "Year",
      "Stage",
      "Type",
      "Location Name",
      "Distance",
    ];
    this.sortOrder = [
      ["raceUID", "asc"],
      ["bib", "asc"],
    ];
  }
}
