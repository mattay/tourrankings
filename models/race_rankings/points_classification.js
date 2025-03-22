import CSVdataModel from "../../utils/dataModel_csv.js";

class PointsClassification extends CSVdataModel {
  constructor() {
    super("models/race_rankings/points_classification_data.csv", [
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

export default PointsClassification;
