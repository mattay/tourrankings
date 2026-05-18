import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('@models/@types/races').RaceStageLocationMountainModel} RaceStageLocationMountainModel
 */

/**
 * Class for managing mountains location data within race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for mountains location records in race stages.
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
      `${getDataDir()}/raceStageLocationMountains.csv`,
      ["locationUID"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Location UID",
      "Stage UID",
      "Year",
      "Stage",
      "Type",
      "Location",
      "Distance",
    ];
    this.sortOrder = [
      ["locationUID", "asc"],
      // ["stage", "asc"],
    ];
    this.validateConfig();
  }
}
