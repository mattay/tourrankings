import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/classifications').ClassificationPointModel} ClassificationPointModel
 */

/**
 * Class for managing race stage classification points loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for classification points data.
 *
 * @extends CSVdataModel
 */
export class ClassificationPoints extends CSVdataModel {
  /** @type {ClassificationPointModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageClassificationPoints.csv`, [
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
      "Points",
      "Today",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}
