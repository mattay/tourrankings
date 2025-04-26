import CSVdataModel from "../dataModel_csv.js";

/** @typedef {Object} RaceRiderData -
 * @property {string} raceId - The unique identifier of the race.
 * @property {string} bib - The bib number of the rider.
 * @property {string} riderId - The unique identifier of the rider.
 * @property {string} teamId - The unique identifier of the team.
 * @property {string} rider - The name of the rider.
 * @property {string} flag - The flag of the rider's country.
 */

/**
 * RaceRiders class extends CSVdataModel and represents race riders data.
 */
export class RaceRiders extends CSVdataModel {
  constructor() {
    super("data/raw/csv/raceRiders.csv", ["Race Id", "Bib"]);
    this.csvHeaders = [
      "Race Id",
      "Bib",
      "Rider Id",
      "Team Id",
      "Rider",
      "Flag",
    ];
    this.sortOrder = [
      ["Race Id", "asc"],
      ["Bib", "asc"],
    ];
  }
}
