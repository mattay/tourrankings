import {
  Races,
  RaceStages,
  RaceStageResults,
  Teams,
  Riders,
  RaceRiders,
  ClassificationGeneral,
  ClassificationMountain,
  ClassificationPoints,
  ClassificationTeam,
  ClassificationYouth,
} from "../../models";
import { logError, logOut } from "../../utils/logging";

/**
 * Classes
 * @typedef {import('../../models/@types/races').RaceModel} RaceData
 * @typedef {import('../../models/@types/races').RaceStageModel} RaceStageData
 * @typedef {import('../../models/@types/races').RaceStageResultModel} RaceStageResultData
 * @typedef {import('../../models/@types/races').RaceRiderModel} RaceRiderData
 * @typedef {import('../../models/@types/teams').TeamModel} TeamData
 * @typedef {import('../../models/@types/riders').RiderModel} RiderData
 */

/**
 * Constructor for the DataService class.
 */
class DataService {
  DATA_SERVICE_ERROR = {
    NOT_INITIALIZED: "Repository must be initialized before querying data",
    LOAD_MODELS_FAILED: "Failed to load data models",
    INITIALIZATION_FAILED: "Failed to initialize data service",
  };
  /**
   * Constructor for the DataService class.
   * @constructor
   */
  constructor(options = {}) {
    logOut("DataService", "Starting...");

    // Default options
    this.options = {
      autoRefresh: false,
      refreshInterval: 3600000, // 1 hour in ms
      ...options,
    };

    // Initialize models
    this.races = new Races();
    this.stages = new RaceStages();
    this.stageResults = new RaceStageResults();
    this.teams = new Teams();
    this.riders = new Riders();
    this.raceRiders = new RaceRiders();
    this.classificationGeneral = new ClassificationGeneral();
    this.classificationMountain = new ClassificationMountain();
    this.classificationPoints = new ClassificationPoints();
    this.classificationTeam = new ClassificationTeam();
    this.classificationYouth = new ClassificationYouth();

    // State
    this.isInitialized = false;
    this.lastRefreshTime = null;
    this._refreshTimer = null;
  }

  /**
   * Initialize repository - load all data
   * @param {boolean} forceRefresh - Force refresh even if already initialized
   * @returns {Promise<void>}
   */
  async initialize(forceRefresh = false) {
    if (this.isInitialized && !forceRefresh) return;

    // Load all data models concurrently
    const loaded = await Promise.allSettled([
      this.races.read(),
      this.stages.read(),
      this.stageResults.read(),
      this.teams.read(),
      this.riders.read(),
      this.raceRiders.read(),
      this.classificationGeneral.read(),
      this.classificationMountain.read(),
      this.classificationPoints.read(),
      this.classificationTeam.read(),
      this.classificationYouth.read(),
    ]);

    this.isInitialized = true;
    this.lastRefreshTime = new Date();

    loaded.forEach((result, i) => {
      if (result.status === "rejected") {
        this.isInitialized = false;
        logError(this.constructor.name, result.reason.message);
      }
    });

    if (!this.isInitialized) {
      logError(
        this.constructor.name,
        this.DATA_SERVICE_ERROR.LOAD_MODELS_FAILED,
      );
      throw new Error(this.DATA_SERVICE_ERROR.INITIALIZATION_FAILED);
    }

    // Set up auto refresh if enabled
    if (
      this.options.autoRefresh &&
      !this._refreshTimer &&
      typeof window === "undefined"
    ) {
      // Only set up auto-refresh on server, not in browser
      this._refreshTimer = setInterval(() => {
        this.refreshData();
      }, this.options.refreshInterval);
    }
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  /**
   * Refresh data from CSV files
   * @returns {Promise<void>}
   */
  async refreshData() {
    if (!this.isInitialized) {
      return this.initialize();
    }

    await this.initialize(true);
    logOut("DataService", "Data refreshed");
  }

  /**
   * Get all races for a specific year
   * @param {number} year - The year to filter races by
   * @returns {Array<RaceData>} - Array of races for the specified year
   */
  seasonRaces(year) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    if (!year) {
      throw new Error(this.DATA_SERVICE_ERROR.INVALID_INPUT);
    }
    return this.races.season(year);
  }

  /**
   * Get details for a specific race
   * @param {Object} params - The parameters object.
   * @param {string} [params.raceUID] - The unique identifier of the race.
   * @param {string} [params.racePcsID] - The unique identifier of the race.
   * @param {number} [params.year] - The year of the race.
   */
  raceDetails({ raceUID, racePcsID, year }) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }

    if (!raceUID && !racePcsID) {
      throw new Error(this.DATA_SERVICE_ERROR.INVALID_INPUT);
    } else if (raceUID) {
      logOut("DataService", `raceUID ${raceUID} -> ${year}`);
      return this.races.raceUID(raceUID);
    } else if (racePcsID) {
      logOut("DataService", `racePcsID ${racePcsID} -> ${year}`);
      return this.races.racePcsID(racePcsID, year);
    }
  }

  /**
   * Get stages for a specific race
   * @param {string} raceUID - The unique identifier of the race
   * @returns {RaceStageData[]} Promise that resolves to the stages details
   */
  raceStages(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.stages.stagesInRace(raceUID);
  }

  /**
   * Get teams for a specific race
   * @param {string} raceUID - The unique identifier of the race
   * @returns {TeamData[]} Promise that resolves to the teams details
   */
  raceTeams(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.teams.teamsInRace(raceUID);
  }

  /**
   * Get team details for a specific race
   * @param {string} teamID - The unique identifier of the team
   * @returns {TeamData} Promise that resolves to the team details
   */
  raceTeam(teamID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.teams.teamById(teamID);
  }

  /**
   * Get riders for a specific race
   * @param {string} raceUID - The unique identifier of the race
   * @returns {RaceRiderData[]} Promise that resolves to the riders details
   */
  ridersInRace(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.raceRiders.ridersInRace(raceUID);
  }

  /**
   * Get results for a specific race
   * Stages are indexed by the stage number in the array. Eg Prologe at 0 else races start at 1
   * @param {string} raceUID - The unique identifier of the race
   * @returns {Array<RaceStageResultData[]>} Promise that resolves to the results details
   */
  raceResults(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }

    const stageResults = [];
    for (const stage of this.stages.stagesInRace(raceUID)) {
      const results = this.stageResults.getStageResults(stage.stageUID);
      if (!results) {
        logError(
          this.constructor.name,
          `No results for stage ${stage.stageUID}`,
        );
      } else {
        stageResults[stage.stage] = results;
      }
    }
    return stageResults;
  }

  raceClassificationsPoints(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    const stagePoints = [];
    for (const stage of this.stages.stagesInRace(raceUID)) {
      const results = this.classificationPoints.getStagePoints(stage.stageUID);
      if (!results) {
        logError(
          this.constructor.name,
          `No results for stage ${stage.stageUID}`,
        );
      } else {
        stagePoints[stage.stage] = results;
      }
    }

    return stagePoints;
  }
}

export default DataService;
