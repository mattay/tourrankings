import CSVdataModel from "../utils/dataModel_csv.js";

class RaceRiders extends CSVdataModel {
  constructor() {
    super("race_riders/race_riders_data.csv", ["Race Id", "Bib"]);
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

export default RaceRiders;
