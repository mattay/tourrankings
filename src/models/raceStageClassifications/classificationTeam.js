import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/classifications').ClassificationTeamModel} ClassificationTeamModel
 */

/**
 * Class for managing team classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for team classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationTeam extends CSVdataModel {
  /** @type {ClassificationTeamModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageClassificationTeams.csv`, [
      "Stage UID",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage UID",
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
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }
}
