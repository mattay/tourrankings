import { logError } from "@utils/logging";
import CSVdataModel from "../dataModel_csv";

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
    super(`${process.env.DATA_DIR}/teams.csv`, ["Pcs Id"], fieldTypes);
    this.csvHeaders = [
      "Year",
      "Pcs Id",
      "Name",
      "Classification",
      "Pcs Url",
      "Jersey Image Pcs Url",
      "Previous Pcs Id",
      "Next Pcs Id",
    ];
    this.sortOrder = [
      ["year", "asc"],
      ["teamName", "asc"],
    ];
    this.validateConfig();
  }

  /**
   * Retrieve a team by its ID.
   *
   * @param {String} teamId - The ID of the team to retrieve.
   * @returns {TeamModel|null} The team object if found, otherwise null.
   */
  teamById(teamId) {
    return this.rows.find((team) => team.pcsId === teamId);
  }

  teamsInRace(raceUID) {
    logError(
      this.constructor.name,
      "There is not a raceUID in the teams model",
    );
    return null;
  }
}
