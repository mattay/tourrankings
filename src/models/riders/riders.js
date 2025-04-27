import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} RiderData - Rider data object
 * @property {string} riderId - Unique identifier for the rider
 * @property {string} riderName - Full name of the rider
 * @property {string} dateOfBirth - Date of birth of the rider
 * @property {string} nationality - Nationality of the rider
 */

/**
 * Riders class extends CSVdataModel to handle rider data.
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
