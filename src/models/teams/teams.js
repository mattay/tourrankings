import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} TeamData
 * @property {number} year - The year the team was established.
 * @property {string} teamPcsId - The unique identifier for the team.
 * @property {string} teamName - The name of the team.
 * @property {string} classification - The classification of the team.
 * @property {string} jerseyImagePcsUrl - The URL of the team's jersey image.
 * @property {string} previousTeamPcsId - The unique identifier of the previous team.
 * @property {string} nextTeamPcsId - The unique identifier of the next team.
 */

/**
 * @class Teams
 * @extends CSVdataModel
 * @description Represents the teams data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class Teams extends CSVdataModel {
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
