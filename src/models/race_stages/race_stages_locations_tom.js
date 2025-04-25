import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} RaceStageLocationMountainData
 * @property {string} locationId - Unique identifier for the location.
 * @property {string} stageId - Unique identifier for the stage.
 * @property {string} year - Year of the race.
 * @property {string} stage - Name of the stage.
 * @property {string} type - Type of the stage.
 * @property {string} locationName - Name of the location.
 * @property {string} distance
 */

class RaceStageLocationMountain extends CSVdataModel {
  constructor() {
    super("data/raw/csv/race_stages_locations_tom_data.csv", [
      "Location Id",
      "Stage Id",
    ]);
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
      ["Race Id", "asc"],
      ["Stage", "asc"],
    ];
  }
}

export default RaceStageLocationMountain;
