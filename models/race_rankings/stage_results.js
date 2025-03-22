import CSVdataModel from "../../utils/dataModel_csv.js";

class StageResults extends CSVdataModel {
  constructor() {
    super("models/race_rankings/stage_results_data.csv", ["Stage Id", "Rank"]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "GC",
      "Timelag",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
      "UCI",
      "Points",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}

export default StageResults;
