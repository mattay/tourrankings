import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageLocationPointsData
 * @property {number} locationID - The unique identifier for the location.
 * @property {number} stageId - The unique identifier for the stage.
 * @property {number} year - The year of the race.
 * @property {number} stage - The stage number.
 * @property {string} type - The type of the stage.
 * @property {string} locationName - The name of the location.
 * @property {number} distance - The distance of the stage.
 */

export class RaceStageLocationPoints extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceStageLocationPoints.csv", ["Location ID", "Bib"]);
    this.csvHeaders = [
      "Location ID",
      "Stage Id",
      "Year",
      "Stage",
      "Type",
      "Location Name",
      "Distance",
    ];
    this.sortOrder = [
      ["raceId", "asc"],
      ["bib", "asc"],
    ];
  }
}
