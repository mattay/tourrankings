import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('@models/@types/races').RaceStageLocationPointResultModel} RaceStageLocationPointsResultModel
 */

/**
 * Class for managing race stage location points results loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for sprint point results
 * at intermediate locations within race stages.
 *
 * @extends CSVdataModel
 */
export class RaceStageLocationPointsResults extends CSVdataModel {
  /** @type {RaceStageLocationPointsResultModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      rank: "number",
      bib: "number",
      points: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageLocationPointsResults.csv`,
      ["locationUID", "bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Location UID",
      "Rank",
      "Bib",
      "Points",
      "Bonis",
      "Today",
    ];
    this.sortOrder = [
      ["locationUID", "asc"],
      ["rank", "asc"],
    ];
    this.validateConfig();
  }

  /**
   * Gets results for a specific location.
   * @param {string} locationUID - The location UID
   * @returns {RaceStageLocationPointsResultModel[]} Results for the location
   */
  getLocationResults(locationUID) {
    if (!locationUID) {
      return this.rows;
    }
    return this.rows.filter((row) => row.locationUID === locationUID);
  }
}
