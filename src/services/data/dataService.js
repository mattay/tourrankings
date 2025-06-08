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
 * @typedef {import('../../models/@types/classifications').ClassificationPointModel} ClassificationPointsData
 * @typedef {import('../../models/@types/classifications').ClassificationMountainModel} ClassificationMountainData
 * @typedef {import('../../models/@types/classifications').ClassificationGeneralModel} ClassificationGeneralData
 * @typedef {import('../../models/@types/classifications').ClassificationYouthModel} ClassificationYouthData
 * @typedef {import('../../models/@types/classifications').ClassificationTeamModel} ClassificationTeamData
 */

/**
 * DataService provides methods to load and query cycling race data from various models.
 * It supports initialization, auto-refresh, and a range of data accessors for races, teams, riders, and classifications.
 *
 * @class
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
   * Initializes the repository by loading all data models.
   * If already initialized, does nothing unless forceRefresh is true.
   *
   * @param {boolean} [forceRefresh=false] - If true, forces a reload of all data models.
   * @returns {Promise<void>}
   * @throws {Error} If initialization fails.
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
   * Releases resources, such as timers, used by the service.
   *
   * @returns {void}
   */
  dispose() {
    if (this._refreshTimer) {
      clearInterval(this._refreshTimer);
      this._refreshTimer = null;
    }
  }

  /**
   * Refreshes all data from the source.
   *
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
   * Returns all races for a given year.
   *
   * @param {number} year - The year to filter races by.
   * @returns {RaceData[]} Array of races for the specified year.
   * @throws {Error} If the service is not initialized or year is invalid.
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
   * Retrieves details for a specific race.
   *
   * @param {Object} params - Query parameters.
   * @param {string} [params.raceUID] - Unique identifier for the race.
   * @param {string} [params.racePcsID] - PCS identifier for the race.
   * @param {number} [params.year] - Year of the race.
   * @returns {RaceData|undefined} The race details, or undefined if not found.
   * @throws {Error} If not initialized or if required parameters are missing.
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
   * Returns all stages for a given race.
   *
   * @param {string} raceUID - Unique identifier for the race.
   * @returns {RaceStageData[]} Array of stages for the race.
   * @throws {Error} If the service is not initialized.
   */
  raceStages(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.stages.stagesInRace(raceUID);
  }

  /**
   * Retrieves all teams participating in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {TeamData[]} Array of team details for the specified race.
   * @throws {Error} If the service is not initialized.
   */
  raceTeams(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.teams.teamsInRace(raceUID);
  }

  /**
   * Retrieves details for a specific team by its ID.
   *
   * @param {string} teamID - The unique identifier of the team.
   * @returns {TeamData} The team details.
   * @throws {Error} If the service is not initialized.
   */
  raceTeam(teamID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.teams.teamById(teamID);
  }

  /**
   * Retrieves all riders participating in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {RaceRiderData[]} Array of rider details for the specified race.
   * @throws {Error} If the service is not initialized.
   */
  ridersInRace(raceUID) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    return this.raceRiders.ridersInRace(raceUID);
  }

  /**
   * Helper to retrieve classification results for all stages in a specific race.
   *
   * @private
   * @param {string} raceUID - The unique identifier of the race.
   * @param {Object} classificationModel - The model with a getStageRankings method.
   * @param {string} classificationName - Name for logging.
   * @returns {Array<Object[]>} Array of classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  _getStageClassifications(raceUID, classificationModel, classificationName) {
    if (!this.isInitialized) {
      throw new Error(this.DATA_SERVICE_ERROR.NOT_INITIALIZED);
    }
    const stageRankings = [];
    for (const stage of this.stages.stagesInRace(raceUID)) {
      const results = classificationModel.getStageRankings(stage.stageUID);
      if (!results) {
        logError(
          this.constructor.name,
          `No ${classificationName} results for stage ${stage.stageUID}`,
        );
      } else {
        stageRankings[stage.stage] = results;
      }
    }
    return stageRankings;
  }

  /**
   * Retrieves results for all stages in a specific race.
   * Stages are indexed by the stage number in the returned array.
   * For example, a prologue is at index 0, otherwise stages start at 1.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<RaceStageResultData[]>} Array of stage results arrays, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceResults(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.stageResults,
      "stage results",
    );
  }

  /**
   * Retrieves general classification results for all stages in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<ClassificationGeneralData[]>} Array of general classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceClassificationsGeneral(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.classificationGeneral,
      "general classification",
    );
  }

  /**
   * Retrieves general classification results for all stages in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<ClassificationYouthData[]>} Array of general classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceClassificationsYouth(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.classificationYouth,
      "youth classification",
    );
  }

  /**
   * Retrieves points classification results for all stages in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<ClassificationPointsData[]>} Array of points classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceClassificationsPoints(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.classificationPoints,
      "points classification",
    );
  }

  /**
   * Retrieves mountain classification results for all stages in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<ClassificationMountainData[]>} Array of mountain classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceClassificationsMountain(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.classificationMountain,
      "mountain classification",
    );
  }

  /**
   * Retrieves mountain classification results for all stages in a specific race.
   *
   * @param {string} raceUID - The unique identifier of the race.
   * @returns {Array<ClassificationTeamData[]>} Array of mountain classification results, indexed by stage number.
   * @throws {Error} If the service is not initialized.
   */
  raceClassificationsTeams(raceUID) {
    return this._getStageClassifications(
      raceUID,
      this.classificationTeam,
      "team classification",
    );
  }
}

export default DataService;
