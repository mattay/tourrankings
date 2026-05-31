import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

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
    super(`${getDataDir()}/riders.csv`, ["Rider Pcs Id"], fieldTypes);
    this.csvHeaders = [
      "Rider Pcs Id",
      "Surname",
      "First Names",
      "Date Of Birth",
      "Nationality",
      "Flag",
    ];
    this.sortOrder = [
      ["surname", "asc"],
      ["firstNames", "asc"],
    ];
    this.validateConfig();
  }
}
