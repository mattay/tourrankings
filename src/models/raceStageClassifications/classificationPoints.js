import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/classifications').ClassificationPointModel} ClassificationPointModel
 */

/**
 * Class for managing race stage classification points loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for classification points data.
 *
 * @extends CSVdataModel
 */
export class ClassificationPoints extends CSVdataModel {
  /** @type {ClassificationPointModel[]} */
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
      //today: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStageClassificationPoints.csv`,
      ["Stage UID", "Rank"],
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
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage UID", "asc"],
      ["Rank", "asc"],
    ];
  }

  /**
   * Retrieves the stage points for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {ClassificationPointModel[]|null} - Returns an array of stage points.
   */
  getStagePoints(stageUID) {
    if (!stageUID) {
      console.error("stageId is required for getStageResults()");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
