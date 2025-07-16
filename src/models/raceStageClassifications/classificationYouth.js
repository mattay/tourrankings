import { logError } from "../../utils/logging";
import CSVdataModel from "../dataModel_csv";

/**
 * @typedef {import('../@types/classifications').ClassificationYouthModel} ClassificationYouthModel
 */

/**
 * Class for managing youth classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for youth classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationYouth extends CSVdataModel {
  /** @type {ClassificationYouthModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      stage: "number",
      rank: "number",
      previousStageRanking: "number",
      change: "number",
      bib: "number",
      age: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageClassificationYouth.csv`,
      ["Stage UID", "Bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Stage UID",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "Bib",
      "Specialty",
      "Rider",
      "Age",
      "Team",
    ];
    this.sortOrder = [
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }

  /**
   * Retrieves the stage points for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {ClassificationYouthModel[]|null} - Returns an array of stage points.
   */
  getStageRankings(stageUID) {
    if (!stageUID) {
      logError(this.constructor.name, "getStageRankings expects stageUID");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
