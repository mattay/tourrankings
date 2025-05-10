import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/races').RaceStageResultModel} RaceStageResultModel
 */

/**
 * Class for managing race stage results loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race stage result records.
 *
 * @extends CSVdataModel
 */
export class RaceStageResults extends CSVdataModel {
  /** @type {RaceStageResultModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageResults.csv`, [
      "Stage UID",
      "Rank",
    ]);
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
   * @returns {RaceStageResultData[]|null} - A promise that resolves to an array of stage results.
   */
  getStageResults(stageUID) {
    if (!stageUID) {
      console.error("stageId is required for getStageResults()");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
