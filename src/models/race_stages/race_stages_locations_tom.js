import CSVdataModel from "../../utils/dataModel_csv.js";

class RaceRiders extends CSVdataModel {
  constructor() {
    super("data/raw/csv/race_stages_locations_tom_data.csv", [
      "Location Id",
      "Stage Id",
    ]);
    this.csvHeaders = [
      "Location ID",
      "Stage Id",
      "Year",
      "Stage",
      "Type",
      "Location Name",
      "Distance",
    ];
    this.sortOrder = [
      ["Race Id", "asc"],
      ["Stage", "asc"],
    ];
  }
}

export default RaceRiders;
