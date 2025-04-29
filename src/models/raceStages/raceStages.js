import { logError } from "../../utils/logging.js";
import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageData
 * @property {string} stageUID - The unique identifier for the stage.
 * @property {string} raceUID - The unique identifier for the race (matches RaceData.raceId).
 * @property {number} year - The year of the stage.
 * @property {string} date - The date of the stage.
 * @property {number} stage - The stage number.
 * @property {string} stageType - The type of the stage.
 * @property {string} parcoursType - The type of the parcours.
 * @property {string} departure - The departure location of the stage.
 * @property {string} arrival - The arrival location of the stage.
 * @property {number} distance - The distance of the stage in kilometers.
 * @property {number} verticalMeters - The vertical meters of the stage.
 */

/**
 * @class RaceStages
 * @extends CSVdataModel
 * @description Represents a collection of race stages.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceStages extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStages.csv", ["Stage UID", "Race UID"]);
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
   * @param {Array<RaceStageData>} stages - The array of stages to filter.
   * @returns {Generator<RaceStageData>} - A generator of past stages.
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
   * @returns {Array<RaceStageData>|null} - An array of stages in the specified race.
   */
  stagesInRace(raceUID) {
    if (!raceUID) {
      logError("RaceStages", "raceUID is required for stagesInRace()");
      return null;
    }
    return this.rows.filter((row) => row.raceUID == raceUID);
  }
}
