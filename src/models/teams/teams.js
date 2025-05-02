import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {import('../@types/teams').TeamModel} TeamModel
 */

/**
 * Class for managing cycling team data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to handle team-specific CSV data operations.
 *
 * @extends CSVdataModel
 */
export class Teams extends CSVdataModel {
  /** @type {TeamModel[]} */
  rows = [];

  constructor() {
    super(`${process.env.DATA_DIR}/teams.csv`, ["Team Pcs Id"]);
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
