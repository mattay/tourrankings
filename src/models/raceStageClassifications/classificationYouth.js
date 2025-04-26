import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} ClassificationYouthData -
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the rider in the stage.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 */

/**
 * Represents a classification for youth riders in a race stage.
 */
export class ClassificationYouth extends CSVdataModel {
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
