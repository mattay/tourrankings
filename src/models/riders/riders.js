import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing rider data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for rider-specific CSV data.
 *
 * @extends CSVdataModel
 */
export class Riders extends CSVdataModel {
  /** @type {RiderData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/riders.csv", ["Rider Pcs Id"]);
    this.csvHeaders = [
      "Rider Pcs Id",
      "Rider Name",
      "Date Of Birth",
      "Nationality",
    ];
    this.sortOrder = [["Rider Name", "asc"]];
  }
}
