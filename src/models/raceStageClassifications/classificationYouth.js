import CSVdataModel from "../dataModel_csv.js";

/**
 * @class ClassificationYouth
 * @extends CSVdataModel
 * @description Represents a classification for youth riders in a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationYouth extends CSVdataModel {
  /** @type {ClassificationYouthData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceStageClassificationYouth.csv", [
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
