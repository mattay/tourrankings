import { logError } from "@utils/logging";
import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('../@types/classifications').ClassificationGeneralModel} ClassificationGeneralModel
 */

/**
 * Class for managing general classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for general classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationGeneral extends CSVdataModel {
  /** @type {ClassificationGeneralModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      stage: "number",
      rank: "number",
      previousStageRanking: "number",
      delta: "number",
      bib: "number",
      uCI: "number", // Matches toCamelCase("UCI") - see issue #341 for future standardization
    };
    super(
      `${getDataDir()}/raceStageClassificationGeneral.csv`,
      ["stageUID", "bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Stage UID",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Delta",
      "Bib",
      "UCI",
      "Bonis",
      "Time",
      "Time Wonlost",
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
   * @returns {ClassificationGeneralModel[]|null} - Returns an array of stage points.
   */
  getStageRankings(stageUID) {
    if (!stageUID) {
      logError(this.constructor.name, "getStageRankings expects stageUID");
      return null;
    }

    return this.rows.filter((record) => record.stageUID === stageUID);
  }
}
