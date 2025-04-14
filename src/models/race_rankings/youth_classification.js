import CSVdataModel from "../../utils/dataModel_csv.js";

class YouthClassification extends CSVdataModel {
  constructor() {
    super("data/raw/csv/youth_classification_data.csv", ["Stage Id", "Rank"]);
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
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}

export default YouthClassification;
