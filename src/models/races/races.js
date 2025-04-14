import CSVdataModel from "../../utils/dataModel_csv.js";

class Races extends CSVdataModel {
  constructor() {
    super("data/raw/csv/races_data.csv", ["raceId"]);
    this.csvHeaders = [
      "Year",
      "Start Date",
      "End Date",
      "Race Class",
      "Race Id",
      "Race Name",
      "Race Url Id",
      "Race Url",
    ];
  }

  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }

  async season(year) {
    await this.read(); // Refresh
    console.log(year);

    return this.rows.filter((record) => {
      return record.year === year;
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

export default Races;
