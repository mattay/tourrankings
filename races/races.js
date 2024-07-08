import CSVdataModel from "../utils/dataModel_csv.js";

class Race extends CSVdataModel {
  constructor() {
    super("races/races_data.csv", ["raceId"]);
    this.csvHeaders = [
      "Year",
      "Start Date",
      "End Date",
      "Class",
      "Race Id",
      "Race Name",
      "Race Url",
    ];
  }

  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }

  async past() {
    await this.read(); // Refresh
    const today = new Date();

    return this.rows.filter((record) => {
      const raceEndDate = new Date(record.endDate);
      return today <= raceEndDate;
    });
  }

  async inProgress() {
    await this.read(); // Refresh
    const today = new Date();

    return this.rows.filter((record) => {
      const raceStartDate = new Date(record.startDate);
      const raceEndDate = new Date(record.endDate);
      return today >= raceStartDate && today <= raceEndDate;
    });
  }

  async upcoming() {
    await this.read(); // Refresh
    const today = new Date();

    return this.rows.filter((record) => {
      const raceStartDate = new Date(record.startDate);
      return today <= raceStartDate;
    });
  }

  async racesInYear(year) {
    await this.read(); // Refresh

    return this.rows.filter((record) => {
      return record.year == year;
    });
  }
}

export default Race;
