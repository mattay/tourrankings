import CSVdataModel from "../../utils/dataModel_csv.js";

class Riders extends CSVdataModel {
  constructor() {
    super("models/riders/riders_data.csv", ["Rider Id"]);
    this.csvHeaders = [
      "Rider Id",
      "Rider Name",
      "Date Of Birth",
      "Nationality",
    ];
    this.sortOrder = [["Rider Name", "asc"]];
  }
}

export default Riders;
