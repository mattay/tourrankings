import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} RiderData - Rider data object
 * @property {string} riderId - Unique identifier for the rider
 * @property {string} riderName - Full name of the rider
 * @property {string} dateOfBirth - Date of birth of the rider
 * @property {string} nationality - Nationality of the rider
 */

/**
 * @class Riders
 * @extends CSVdataModel
 * @description Represents the riders data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class Riders extends CSVdataModel {
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
