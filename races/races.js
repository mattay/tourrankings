import CSVdataModel from "../utils/dataModel_csv.js";

class Race extends CSVdataModel {
  constructor() {
    super("races/data_races.csv", "raceUrl");
    this.csvHeaders = [
      "Year",
      "StartDate",
      "EndDate",
      "RaceName",
      "RaceUrl",
      "Class",
    ];
  }

  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }
}

export default Race;
