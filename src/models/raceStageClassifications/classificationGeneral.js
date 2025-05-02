import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing general classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for general classification records.
 *
 * @extends CSVdataModel
 */

/**
 * @class ClassificationGeneral
 * @extends CSVdataModel
 * @description Represents the general classification data for a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationGeneral extends CSVdataModel {
  /** @type {ClassificationGeneralData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceStageClassificationGeneral.csv", [
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
      "UCI",
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
