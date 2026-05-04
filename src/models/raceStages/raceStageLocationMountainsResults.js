import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('@models/@types/races').RaceStageLocationMountainResultModel} RaceStageLocationMountainResultModel
 */

/**
 * Class for managing race stage location mountains results loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for KOM point results
 * at intermediate mountains locations within race stages.
 *
 * @extends CSVdataModel
 */
export class RaceStageLocationMountainsResults extends CSVdataModel {
  /** @type {RaceStageLocationMountainResultModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      rank: "number",
      bib: "number",
      points: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageLocationMountainsResults.csv`,
      ["locationUID", "bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Location UID",
      "Rank",
      "Bib",
      "Points",
      "Bonis",
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
   * @returns {RaceStageLocationMountainResultModel[]} Results for the location
   */
  getLocationResults(locationUID) {
    if (!locationUID) {
      return this.rows;
    }
    return this.rows.filter((row) => row.locationUID === locationUID);
  }
}
