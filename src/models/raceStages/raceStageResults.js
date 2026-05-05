import { logError } from "@utils/logging";
import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('../@types/races').RaceStageResultModel} RaceStageResultModel
 */

/**
 * Class for managing race stage results loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race stage result records.
 *
 * @extends CSVdataModel
 */
export class RaceStageResults extends CSVdataModel {
  /** @type {RaceStageResultModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      stage: "number",
      rank: "number",
      gC: "number",
      bib: "number",
      age: "number",
      uCI: "number",
      points: "number",
    };
    super(
      `${getDataDir()}/raceStageResults.csv`,
      ["stageUID", "bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Stage UID",
      "Stage",
      "Rank",
      "GC",
      "Timelag",
      "Bib",
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
      ["stageUID", "asc"],
      ["rank", "asc"],
    ];
    this.validateConfig();
  }

  /**
   * Retrieves the stage results for a given stage ID.
   * @param {string} stageUID - The ID of the stage.
   * @returns {RaceStageResultModel[]|null} - A promise that resolves to an array of stage results.
   */
  getStageRankings(stageUID) {
    if (!stageUID) {
      logError(this.constructor.name, "getStageRankings expects stageUID");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
