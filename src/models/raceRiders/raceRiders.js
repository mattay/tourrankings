import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} RaceRiderData -
 * @property {string} raceUID - The unique identifier of the race.
 * @property {string} bib - The bib number of the rider.
 * @property {string} riderPcsId - The unique identifier of the rider.
 * @property {string} teamPcsId - The unique identifier of the team.
 * @property {string} rider - The name of the rider.
 * @property {string} flag - The flag of the rider's country.
 */

/**
 * @class RaceRiders
 * @extends CSVdataModel
 * @description Represents the race riders data.
 * @constructor
 * @param {string} filePath - The path to the CSV file.
 * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
 */
export class RaceRiders extends CSVdataModel {
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
