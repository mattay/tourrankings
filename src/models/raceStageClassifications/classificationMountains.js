import { logError } from "@utils/logging";
import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('@models/@types/classifications').ClassificationMountainsModel} ClassificationMountainsModel
 */

/**
 * Class for managing mountains classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for mountains classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationMountains extends CSVdataModel {
  /** @type {ClassificationMountainsModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      stage: "number",
      rank: "number",
      previousStageRanking: "number",
      change: "number",
      bib: "number",
      age: "number",
      points: "number",
      today: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageClassificationMountain.csv`,
      ["stageUID", "bib"],
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
      "Points",
      "Today",
    ];
    this.sortOrder = [
      ["stageUID", "asc"],
      ["rank", "asc"],
    ];
    this.validateConfig();
  }

  /**
   * Retrieves the stage points for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {ClassificationMountainsModel[]|null} - Returns an array of stage points.
   */
  getStageRankings(stageUID) {
    if (!stageUID) {
      logError(this.constructor.name, "getStageRankings expects stageUID");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
