import CSVdataModel from "../utils/dataModel_csv.js";

class GeneralRankings extends CSVdataModel {
  constructor() {
    super("race_rankings/gc_data.csv", ["Stage Id", "Rank"]);
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
      "UCI",
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

export default GeneralRankings;
