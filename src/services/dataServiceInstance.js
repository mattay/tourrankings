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
 * @typedef {import('./data/dataService').PointsData} PointsData
 */

const dataService = new DataService(config.dataService);

export default dataService;
