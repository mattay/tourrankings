import CSVdataModel from "../dataModel_csv.js";

/**
 * @class ClassificationTeam
 * @extends CSVdataModel
 * @description Represents a classification for teams in a race stage.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class ClassificationTeam extends CSVdataModel {
  /** @type {ClassificationTeamData[]} */
  rows = [];

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
