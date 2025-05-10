import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/classifications').ClassificationGeneralModel} ClassificationGeneralModel
 */

/**
 * Class for managing general classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for general classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationGeneral extends CSVdataModel {
  /** @type {ClassificationGeneralModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageClassificationGeneral.csv`, [
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
      "UCI",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }
}
