import CSVdataModel from "../utils/dataModel_csv.js";

class RaceStages extends CSVdataModel {
  constructor() {
    super("race_stages/race_stages_data.csv", ["Stage Id", "Race Id"]);
    this.csvHeaders = [
      "Year",
      "Date",
      "Stage",
      "Stage Type",
      "Parcours Type",
      "Stage Id",
      "Race Id",
      "Departure",
      "Arrival",
      "Distance",
      "Vertical Meters",
    ];
    this.sortOrder = [
      ["Year", "asc"],
      ["Date", "asc"],
      ["Race Id", "asc"],
      ["Stage Id", "asc"],
    ];
  }

  *pastStagesGenerator(stages) {
    const currentDate = new Date();

    for (const stage of stages) {
      const stageDate = new Date(stage.Date.split("/").reverse().join("-"));
      if (stageDate <= currentDate) {
        yield stage;
      }
    }
  }

  async stagesInRace(raceId) {
    await this.read();
    return this.rows.filter((row) => row.raceId == raceId);
  }
}

export default RaceStages;
