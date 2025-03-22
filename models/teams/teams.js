import CSVdataModel from "../../utils/dataModel_csv.js";

class Teams extends CSVdataModel {
  constructor() {
    super("models/teams/teams_data.csv", ["team Id"]);
    this.csvHeaders = [
      "Year",
      "Team Id",
      "Classification",
      "Team Name",
      "Jersey Image Url",
      "Previous Team Id",
      "Next Team Id",
    ];
    this.sortOrder = [
      ["Year", "asc"],
      ["Team Name", "asc"],
    ];
  }
}

export default Teams;
