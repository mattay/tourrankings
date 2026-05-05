import { getDataDir } from "@utils/validation";
import CSVdataModel from "@models/dataModel_csv";

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
      `${getDataDir()}/raceRiders.csv`,
      ["raceUID", "bib"],
      fieldTypes,
    );
    this.csvHeaders = [
      "Race UID",
      "Bib",
      "Pcs Id",
      "Team Pcs Id",
      "Rider",
      "Flag",
    ];
    this.sortOrder = [
      ["raceUID", "asc"],
      ["bib", "asc"],
    ];
    this.validateConfig();
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
