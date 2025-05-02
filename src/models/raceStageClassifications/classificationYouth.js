import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing youth classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for youth classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationYouth extends CSVdataModel {
  /** @type {ClassificationYouthData[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageClassificationYouth.csv`, [
      "Stage Id",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage Id",
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
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}
