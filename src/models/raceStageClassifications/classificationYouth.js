import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/classifications').ClassificationYouthModel} ClassificationYouthModel
 */

/**
 * Class for managing youth classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for youth classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationYouth extends CSVdataModel {
  /** @type {ClassificationYouthModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageClassificationYouth.csv`, [
      "Stage UID",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage UID",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
    ];
    this.sortOrder = [
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }
}
