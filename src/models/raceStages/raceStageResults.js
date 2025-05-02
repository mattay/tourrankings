import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing race stage results loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race stage result records.
 *
 * @extends CSVdataModel
 */

/**
 * @class RaceStageResults
 * @extends CSVdataModel
 * @description Represents the results of a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceStageResults extends CSVdataModel {
  /** @type {RaceStageResultData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceStageResults.csv", ["Stage UID", "Rank"]);
    this.csvHeaders = [
      "Stage UID",
      "Stage",
      "Rank",
      "GC",
      "Timelag",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
      "UCI",
      "Points",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }

  /**
   * Retrieves the stage results for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {Array<RaceStageResultData>|null} - A promise that resolves to an array of stage results.
   */
  stageResults(stageUID) {
    if (!stageUID) {
      console.error("stageId is required for getStageResults()");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
