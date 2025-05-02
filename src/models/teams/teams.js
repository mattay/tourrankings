import CSVdataModel from "../dataModel_csv.js";

/**
 * @class Teams
 * @extends CSVdataModel
 * @description Represents the teams data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class Teams extends CSVdataModel {
  /** @type {TeamData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/teams.csv", ["Team Pcs Id"]);
    this.csvHeaders = [
      "Year",
      "Team Pcs Id",
      "Team Name",
      "Classification",
      "Team Pcs Url",
      "Jersey Image Pcs Url",
      "Previous Team Pcs Id",
      "Next Team Pcs Id",
    ];
    this.sortOrder = [
      ["Year", "asc"],
      ["Team Name", "asc"],
    ];
  }
}
