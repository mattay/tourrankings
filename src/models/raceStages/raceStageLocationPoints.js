import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing race stage location points data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for location point records in race stages.
 *
 * @extends CSVdataModel
 */
export class RaceStageLocationPoints extends CSVdataModel {
  /** @type {RaceStageLocationPointData[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceStageLocationPoints.csv`, [
      "Location ID",
      "Bib",
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
      ["raceUID", "asc"],
      ["bib", "asc"],
    ];
  }
}
