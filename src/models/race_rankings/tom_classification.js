import CSVdataModel from "../../utils/dataModel_csv.js";

class TomClassification extends CSVdataModel {
  constructor() {
    super("data/raw/csv/tom_classification_data.csv", ["Stage Id", "Rank"]);
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

export default TomClassification;
