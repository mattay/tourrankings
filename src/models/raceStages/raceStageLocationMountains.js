import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageLocationMountainsData
 * @property {string} locationId - Unique identifier for the location.
 * @property {string} stageId - Unique identifier for the stage.
 * @property {string} year - Year of the race.
 * @property {string} stage - Name of the stage.
 * @property {string} type - Type of the stage.
 * @property {string} locationName - Name of the location.
 * @property {string} distance
 */

/**
 * @class RaceStageLocationMountains
 * @extends CSVdataModel
 * @description Represents a race stage location on mountains.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceStageLocationMountains extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStagesLocationMountains.csv", [
      "Location Id",
      "Stage Id",
    ]);
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
      ["Race Id", "asc"],
      ["Stage", "asc"],
    ];
  }
}
