import CSVdataModel from "../dataModel_csv";

/**
 * @typedef {import('../@types/riders').RiderModel} RiderModel
 */

/**
 * Class for managing rider data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for rider-specific CSV data.
 *
 * @extends CSVdataModel
 */
export class Riders extends CSVdataModel {
  /** @type {RiderModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {};
    super(`${process.env.DATA_DIR}/riders.csv`, ["Rider Pcs Id"], fieldTypes);
    this.csvHeaders = [
      "Rider Pcs Id",
      "Rider Name",
      "Date Of Birth",
      "Nationality",
    ];
    this.sortOrder = [["Rider Name", "asc"]];
  }
}
