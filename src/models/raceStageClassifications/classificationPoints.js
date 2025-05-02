import CSVdataModel from "../dataModel_csv.js";

/**
 * @class ClassificationPoints
 * @extends CSVdataModel
 * @description Represents a classification for points in a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationPoints extends CSVdataModel {
  /** @type {ClassificationPointsData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceStageClassificationPoints.csv", [
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
