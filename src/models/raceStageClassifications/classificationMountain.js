import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} ClassificationMountainData
 * @property {number} stageId - The unique identifier for the stage.
 * @property {number} stage
 * @property {number} rank - The rank of the rider in the mountain classification.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team.
 * @property {number} points - The points earned by the rider.
 * @property {number} today - The points earned by the rider in the current stage.
 */

/**
 * @class ClassificationMountain
 * @extends CSVdataModel
 * @description Represents the mountain classification data for a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationMountain extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStageClassificationMountain.csv", [
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
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}
