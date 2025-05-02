import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing race riders data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race rider records.
 *
 * @extends CSVdataModel
 */
export class RaceRiders extends CSVdataModel {
  /** @type {RaceRiderData[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/raceRiders.csv`, ["Race UID", "Bib"]);
    this.csvHeaders = [
      "Race UID",
      "Bib",
      "Rider Pcs Id",
      "Team Pcs Id",
      "Rider",
      "Flag",
    ];
    this.sortOrder = [
      ["Race Id", "asc"],
      ["Bib", "asc"],
    ];
  }
}
