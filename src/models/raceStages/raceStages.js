import { logError } from "../../utils/logging.js";
import CSVdataModel from "../dataModel_csv.js";

/** @typedef {import('../@types/races').RaceStageModel} RaceStageModel*/

/**
 * Class for managing a collection of race stage data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race stage records.
 *
 */
export class RaceStages extends CSVdataModel {
  /** @type {RaceStageModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStages.csv`, ["Stage UID", "Race UID"]);
    this.csvHeaders = [
      "Race UID",
      "Stage UID",
      "Year",
      "Date",
      "Stage",
      "Stage Type",
      "Parcours Type",
      "Departure",
      "Arrival",
      "Distance",
      "Vertical Meters",
      "Stage Pcs Url",
    ];
    this.sortOrder = [
      ["Year", "asc"],
      ["Date", "asc"],
      ["Race UID", "asc"],
      ["Stage UID", "asc"],
    ];
  }

  /**
   * @param {RaceStageModel[]} stages - The array of stages to filter.
   * @returns {Generator<RaceStageModel>} - A generator of past stages.
   */
  *pastStagesGenerator(stages) {
    const currentDate = new Date();

    for (const stage of stages) {
      const stageDate = new Date(stage.date.split("/").reverse().join("-"));
      if (stageDate <= currentDate) {
        yield stage;
      }
    }
  }

  /**
   * @param {string} raceUID - The unique identifier for the race.
   * @returns {RaceStageModel[]|null} - An array of stages in the specified race.
   */
  stagesInRace(raceUID) {
    if (!raceUID) {
      logError("RaceStages", "raceUID is required for stagesInRace()");
      return null;
    }
    return this.rows.filter((row) => row.raceUID == raceUID);
  }
}
