import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageData
 * @property {number} year - The year of the stage.
 * @property {string} date - The date of the stage.
 * @property {number} stage - The stage number.
 * @property {string} stageType - The type of the stage.
 * @property {string} parcoursType - The type of the parcours.
 * @property {string} stageId - The unique identifier for the stage.
 * @property {string} raceId - The unique identifier for the race (matches RaceData.raceId).
 * @property {string} departure - The departure location of the stage.
 * @property {string} arrival - The arrival location of the stage.
 * @property {number} distance - The distance of the stage in kilometers.
 * @property {number} verticalMeters - The vertical meters of the stage.
 */

/**
 *
 */
export class RaceStages extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStages.csv", ["Stage Id", "Race Id"]);
    this.csvHeaders = [
      "Year",
      "Date",
      "Stage",
      "Stage Type",
      "Parcours Type",
      "Stage Id",
      "Race Id",
      "Departure",
      "Arrival",
      "Distance",
      "Vertical Meters",
    ];
    this.sortOrder = [
      ["year", "asc"],
      ["date", "asc"],
      ["raceId", "asc"],
      ["stageId", "asc"],
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
   * @param {string} raceId - The unique identifier for the race.
   * @returns {Array<RaceStageData>|null} - An array of stages in the specified race.
   */
  stagesInRace(raceId) {
    if (!raceId) {
      console.error("raceId is required for stagesInRace()");
      return null;
    }
    return this.rows.filter((row) => row.raceId == raceId);
  }
}
