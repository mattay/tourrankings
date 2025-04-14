import CSVdataModel from "../utils/dataModel_csv.js";

class TeamRanking extends CSVdataModel {
  constructor() {
    super("race_rankings/team_data.csv", ["Stage Id", "Rank"]);
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

export default TeamRanking;
