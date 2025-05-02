import CSVdataModel from "../dataModel_csv.js";

/**
 * Class for managing mountain classification data for race stages, loaded from a CSV file.
 *
 * Extends {@link CSVdataModel} to provide specialized handling for mountain classification records.
 *
 * @extends CSVdataModel
 */
export class ClassificationMountain extends CSVdataModel {
  /** @type {ClassificationMountainData[]} */
  rows = [];

  constructor() {
    super("data/raw/csv/raceStageClassificationMountain.csv", [
      "Stage Id",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
      "Points",
      "Today",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}
