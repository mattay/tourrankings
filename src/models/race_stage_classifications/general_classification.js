import CSVdataModel from "../dataModel_csv.js";

/**
 * @typedef {Object} general_classification_data
 * @property {string} stageId - Unique identifier for the stage.
 * @property {string} stage - Name of the stage.
 * @property {number} rank - Rank of the rider in the general classification.
 * @property {number} previousStageRanking - Rank of the rider in the previous stage.
 * @property {number} change - Change in rank from the previous stage.
 * @property {string} bib - Rider's bib number.
 * @property {string} specialty - Rider's specialty.
 * @property {string} rider - Rider's name.
 * @property {number} age - Rider's age.
 * @property {string} team - Rider's team.
 * @property {string} uci - Rider's UCI points won on stage.
 * @property {string} bonis - Bonis won on stage.
 * @property {string} time - Rider's time.
 * @property {string} delta - Rider's delta time.
 */

class GeneralClassification extends CSVdataModel {
  constructor() {
    super("data/raw/csv/general_classification_data.csv", ["Stage Id", "Rank"]);
    this.csvHeaders = [
      "Stage Id",
      "Stage",
      "Rank",
      "Previous Stage Ranking",
      "Change",
      "BIB",
      "Specialty",
      "Rider",
      "Age",
      "Team",
      "UCI",
      "Bonis",
      "Time",
      "Delta",
    ];
    this.sortOrder = [
      ["Stage Id", "asc"],
      ["Rank", "asc"],
    ];
  }
}

export default GeneralClassification;
