import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/races').RaceStageLocationPointModel} RaceStageLocationPointModel
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
      `${process.env.DATA_DIR}/raceStageLocationPoints.csv`,
      ["Location ID", "Bib"],
      fieldTypes,
    );
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
      ["raceUID", "asc"],
      ["bib", "asc"],
    ];
  }
}
