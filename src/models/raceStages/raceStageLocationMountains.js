import CSVdataModel from "../dataModel_csv";

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
    const fieldTypes = {
      year: "number",
      stage: "number",
      distance: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceStagesLocationMountains.csv`,
      ["locationId", "stageUID"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Location Id",
      "Stage UID",
      "Year",
      "Stage",
      "Type",
      "Location Name",
      "Distance",
    ];
    this.sortOrder = [
      ["raceId", "asc"],
      ["stage", "asc"],
    ];
    this.validateConfig();
  }
}
