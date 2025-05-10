import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/races').RaceStageLocationMountainModel} RaceStageLocationMountainModel
 */

/**
 * Class for managing mountain location data within race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for mountain location records in race stages.
 *
 * @extends CSVdataModel
 */
export class RaceStageLocationMountains extends CSVdataModel {
  /** @type {RaceStageLocationMountainModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStagesLocationMountains.csv`, [
      "Location Id",
      "Stage UID",
    ]);
    this.csvHeaders = [
      "Location ID",
      "Stage UID",
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
