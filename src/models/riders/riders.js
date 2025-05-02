import CSVdataModel from "../dataModel_csv.js";

/**
 * @class Riders
 * @extends CSVdataModel
 * @description Represents the riders data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
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
