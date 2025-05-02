import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing team classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for team classification records.
 *
 * @extends CSVdataModel
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
