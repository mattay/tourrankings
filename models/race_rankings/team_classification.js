import CSVdataModel from "../../utils/dataModel_csv.js";

class TeamClassifcation extends CSVdataModel {
  constructor() {
    super("models/race_rankings/team_classification_data.csv", [
      "Stage Id",
      "Rank",
    ]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "Team",
      "Class",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}

export default TeamClassifcation;
