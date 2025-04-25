import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} StageResultData
 * @property {string} stageId - The unique identifier for the stage RaceStageData.stageId.
 * @property {number} stage - The name of the stage.
 * @property {number} rank - The rank of the rider in the stage.
 * @property {number} gc - The General Classification points earned by the rider.
 * @property {string} timelag - The time difference between the rider's time and the winner's time.
 * @property {number} bib - The unique identifier for the rider.
 * @property {string} specialty - The specialty of the rider.
 * @property {string} rider - The name of the rider.
 * @property {number} age - The age of the rider.
 * @property {string} team - The name of the team the rider is part of.
 * @property {string} uci - The UCI classification of the rider.
 * @property {number} points - The points earned by the rider in the stage.
 * @property {number} bonuses - The bonuses earned by the rider in the stage.
 * @property {string} time - The time taken by the rider to complete the stage.
 * @property {string} delta - The time difference between the rider's time and the winner's time.
 */

class StageResults extends CSVdataModel {
  constructor() {
    super("data/raw/csv/stage_results_data.csv", ["Stage Id", "Rank"]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "GC",
      "Timelag",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
      "UCI",
      "Points",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["stageId", "asc"],
      ["rank", "asc"],
    ];
  }

  /**
   * Retrieves the stage results for a given stage ID.
   * @param {string} stageId - The ID of the stage.
   * @returns {Array<StageResultData>|null} - A promise that resolves to an array of stage results.
   */
  getStageResults(stageId) {
    if (!stageId) {
      console.error("stageId is required for getStageResults()");
      return null;
    }

    return this.rows.filter((record) => record.stageId === stageId);
  }
}

export default StageResults;
