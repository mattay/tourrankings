import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} ClassificationTeamData -
 * @property {number} stageId - The unique identifier for the stage.
 * @property {string} stage - The name of the stage.
 * @property {number} rank - The rank of the team in the stage.
 * @property {number} previousStageRanking - The rank of the team in the previous stage.
 * @property {number} change - The change in rank from the previous stage.
 * @property {string} team - The name of the team.
 * @property {string} class - The classification of the team.
 * @property {string} time - The time taken by the team to complete the stage.
 * @property {string} delta - The time difference between the team's time and the fastest time.
 */

/**
 * @class ClassificationTeam
 * @extends CSVdataModel
 * @description Represents a classification for teams in a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationTeam extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStageClassificationTeams.csv", [
      "Stage Id",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "Team",
      "Class",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}
