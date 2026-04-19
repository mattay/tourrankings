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
    super(`${process.env.DATA_DIR}/riders.csv`, ["Pcs Id"], fieldTypes);
    this.csvHeaders = [
      "Pcs Id",
      "Surname",
      "First Names",
      "Date Of Birth",
      "Nationality",
    ];
    this.sortOrder = [
      ["Surname", "asc"],
      ["First Names", "asc"],
    ];
    this.validateConfig();
  }
}
