import config from "server/config.js";
import DataService from "./data/dataService.js";

/**
 * Classes
 * @typedef {import('./data/dataService').RaceData} RaceData
 * @typedef {import('./data/dataService').RaceStageData} RaceStageData
 * @typedef {import('./data/dataService').RaceStageResultData} RaceStageRiderResultData
 * @typedef {import('./data/dataService').RaceRiderData} RaceRiderData
 * @typedef {import('./data/dataService').TeamData} TeamData
 * @typedef {import('./data/dataService').RiderData} RiderData
 * @typedef {import('./data/dataService').ClassificationGeneralData} ClassificationGeneralData
 * @typedef {import('./data/dataService').ClassificationYouthData} ClassificationYouthData
 * @typedef {import('./data/dataService').ClassificationPointsData} ClassificationPointsData
 * @typedef {import('./data/dataService').ClassificationMountainData} ClassificationMountainData
 * @typedef {import('./data/dataService').ClassificationTeamData} ClassificationTeamData
 */

/**
 * Singleton DataService instance.
 *
 * Module scope ensures only ONE instance per module load.
 * On hot reload, old instance is garbage collected and new one is created.
 *
 * @type {DataService}
 */
const dataService = new DataService(config.dataService);

// Clean up on process exit
process.once("exit", () => dataService.dispose());
process.once("SIGINT", () => {
  dataService.dispose();
  process.exit(0);
});
process.once("SIGTERM", () => {
  dataService.dispose();
  process.exit(0);
});

export default dataService;
