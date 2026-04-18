import { logError } from "../../utils/logging";
import CSVdataModel from "../dataModel_csv";

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
    const fieldTypes = {
      stage: "number",
      rank: "number",
      previousStageRanking: "number",
      change: "number",
      bib: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageClassificationTeams.csv`,
      ["Stage UID", "Rank"],
      fieldTypes,
    );
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

  /**
   * Retrieves the stage results for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {ClassificationTeamModel[]|null} - A promise that resolves to an array of stage results.
   */
  getStageRankings(stageUID) {
    if (!stageUID) {
      logError(this.constructor.name, "getStageRankings expects stageUID");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
