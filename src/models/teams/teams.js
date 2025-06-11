import { logOut } from "src/utils/logging.js";
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
    const fieldTypes = {
      year: "number",
    };
    super(`${process.env.DATA_DIR}/teams.csv`, ["Team Pcs Id"], fieldTypes);
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

  /**
   * Retrieve a team by its ID.
   *
   * @param {String} teamId - The ID of the team to retrieve.
   * @returns {TeamModel|null} The team object if found, otherwise null.
   */
  teamById(teamId) {
    return this.rows.find((team) => team.teamPcsId === teamId);
  }

  teamsInRace(raceUID) {
    logOut(this.constructor.name, "There is not a raceUID in the teams model");
    return null;
  }
}
