import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} ClassificationPointsData
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the rider in the classification.
 * @property {number} previousStageRanking - The rank of the rider in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 * @property {number} points - The points earned by the rider in the classification.
 * @property {number} today - The points earned by the rider in the current stage.
 * @property {number} bonis - The bonus points earned by the rider in the classification.
 * @property {string} time - The time taken by the rider to complete the stage.
 * @property {string} delta - The time difference between the rider and the leader.
 */

/**
 *
 */
export class ClassificationPoints extends CSVdataModel {
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
