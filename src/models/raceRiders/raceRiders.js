import CSVdataModel from "../dataModel_csv";

/**
 * @typedef {import('../@types/races').RaceRiderModel} RaceRiderModel
 */

/**
 * Class for managing race riders data loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for race rider records.
 *
 * @extends CSVdataModel
 */
export class RaceRiders extends CSVdataModel {
  /** @type {RaceRiderModel[]} */
  rows = [];

  constructor() {
    const fieldTypes = {
      bib: "number",
    };
    super(
      `${process.env.DATA_DIR}/raceRiders.csv`,
      ["Race UID", "Bib"],
      fieldTypes,
    );
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

  /**
   * Retrieves all riders participating in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {RaceRiderModel[]} An array of race rider models.
   */
  ridersInRace(raceUID) {
    return this.rows.filter((row) => row.raceUID === raceUID);
  }
}
