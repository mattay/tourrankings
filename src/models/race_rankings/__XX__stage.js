import CSVdataModel from "../utils/dataModel_csv.js";

class StageRankings extends CSVdataModel {
  constructor() {
    super("data/raw/csv/stage_data.csv", ["Stage Id", "Rank"]);
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
      ["StageId", "asc"],
      ["Rank", "asc"],
    ];
    this.headerMappings = {
      rnk: "rank",
      pnt: "points",
    };
  }
}

export default StageRankings;
