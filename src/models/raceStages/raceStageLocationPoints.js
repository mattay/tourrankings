import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

/**
 * @typedef {import('@models/@types/races').RaceStageLocationPointModel} RaceStageLocationPointModel
 */

/**
 * Class for managing race stage location points data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for location point records in race stages.
 *
 * @extends CSVdataModel
 */
export class RaceStageLocationPoints extends CSVdataModel {
  /** @type {RaceStageLocationPointModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      year: "number",
      stage: "number",
      distance: "number",
    };
    super(
      `${getDataDir()}/raceStageLocationPoints.csv`,
      ["Location UID"],
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
      // ["distance", "asc"],
    ];
    this.validateConfig();
  }
}
