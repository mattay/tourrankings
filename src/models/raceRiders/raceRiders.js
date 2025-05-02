import CSVdataModel from "../dataModel_csv.js";

/**
 * @class RaceRiders
 * @extends CSVdataModel
 * @description Represents the race riders data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceRiders extends CSVdataModel {
  /** @type {RaceRiderData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceRiders.csv", ["Race UID", "Bib"]);
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
