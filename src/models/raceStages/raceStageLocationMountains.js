import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing mountain location data within race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for mountain location records in race stages.
 *
 * @extends CSVdataModel
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
  /** @type {RaceStageLocationMountainData[]} */
  rows = [];

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
