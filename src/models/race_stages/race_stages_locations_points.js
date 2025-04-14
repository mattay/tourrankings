import CSVdataModel from "../../utils/dataModel_csv.js";

class RaceRiders extends CSVdataModel {
  constructor() {
    super("data/raw/csv/race_stages_locations_points_data.csv", [
      "Location ID",
      "Bib",
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
      ["Bib", "asc"],
    ];
  }
}

export default RaceRiders;
