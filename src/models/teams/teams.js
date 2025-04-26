import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} Team -
 * @property {number} year - The year the team was established.
 * @property {string} teamId - The unique identifier for the team.
 * @property {string} classification - The classification of the team.
 * @property {string} teamName - The name of the team.
 * @property {string} jerseyImageUrl - The URL of the team's jersey image.
 * @property {string} previousTeamId - The unique identifier of the previous team.
 * @property {string} nextTeamId - The unique identifier of the next team.
 */

/**
 */
export class Teams extends CSVdataModel {
  constructor() {
    super("data/raw/csv/teams.csv", ["team Id"]);
    this.csvHeaders = [
      "Year",
      "Team Id",
      "Classification",
      "Team Name",
      "Jersey Image Url",
      "Previous Team Id",
      "Next Team Id",
    ];
    this.sortOrder = [
      ["Year", "asc"],
      ["Team Name", "asc"],
    ];
  }
}
