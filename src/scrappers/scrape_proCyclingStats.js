// Data Models
import {
  Races,
  RaceStages,
  RaceStageResults,
  RaceRiders,
  Teams,
  Riders,
  ClassificationGeneral,
  ClassificationPoints,
  ClassificationMountain,
  ClassificationYouth,
  ClassificationTeam,
  RaceStageLocationPoints,
  RaceStageLocationMountains,
  RaceStageLocationPointsResults,
  RaceStageLocationMountainsResults,
} from "../models";
// Utils
import { generateId } from "@cycling/idGenerator";
import { logError, logOut } from "@utils/logging";
import { parseBool } from "@utils/sanity";
import { logMemoryUsage } from "@utils/memory";
// Scrape
import {
  collectWorldTourRaces,
  scrapeRaceStartList,
  scrapeRaceStages,
  scrapeRaceStageResults,
} from "./source/proCyclingStats";
import { getSeason } from "./season";

const DEBUG_MEMORY = parseBool(process.env.DEBUG_MEMORY, false);

/**
 * Models
 * @typedef {import('../models/@types/races').RaceModel} RaceData
 * @typedef {import('../models/@types/races').RaceStageModel} RaceStageData
 * @typedef {import('../models/@types/teams').TeamModel} TeamData
 * @typedef {import('../models/@types/riders').RiderModel} RiderData
 * @typedef {import('../models/@types/races').RaceStageResultModel} RaceStageResultsData
 * @typedef {import('../models/@types/classifications').ClassificationGeneralModel} ClassificationGeneralModel
 * @typedef {import('../models/@types/classifications').ClassificationYouthModel} ClassificationYouthData
 * @typedef {import('../models/@types/classifications').ClassificationPointModel} ClassificationPointData
 * @typedef {import('../models/@types/classifications').ClassificationMountainModel} ClassificationMountainData
 * @typedef {import('../models/@types/classifications').ClassificationTeamModel} ClassificationTeamData
 * @typedef {import('../models/@types/races').RaceStageLocationPointModel} RaceStageLocationPointsData
 * @typedef {import('../models/@types/races').RaceStageLocationMountainModel} RaceStageLocationMountainsData
 * @typedef {import('../models/@types/races').RaceStageLocationPointResultModel} RaceStageLocationPointResultData
 * @typedef {import('../models/@types/races').RaceStageLocationMountainResultModel} RaceStageLocationMountainResultData
 */

/**
 * Scraped
 * @typedef {import('./source/proCyclingStats/@types').ScrapedRace} ScrapedRace
 * @typedef {import('./source/proCyclingStats/@types').ScrapedRaceStartListTeam} ScrapedRaceStartListTeam
 * @typedef {import('./source/proCyclingStats/@types').ScrapedRaceStartListRider} ScrapedRaceStartListRider
 * @typedef {import('./source/proCyclingStats/@types').ScrapedRaceStartListStaff} ScrapedRaceStartListStaff
 * @typedef {import('./source/proCyclingStats/@types').ScrapedRaceStage} ScrapedRaceStage
 */

/**
 * @typedef {RaceData & { stages: Array<RaceStageData> }} RaceWithStagesList
 * @typedef {RaceData & { stages: Array<RaceStageData>, teams: Array<TeamData>, riders: Array<RiderData> }} RaceWithStages
 */

/**
 * Modified results of scrapeRaceStartList()
 *
 * @typedef {ScrapedRaceStartListTeam & { year: number }} ScrapedRaceTeam
 * @typedef {ScrapedRaceStartListRider & { raceUID: string, teamPcsId: string }} ScrapedRaceRider
 */

/**
 * Returned by collectRace()
 *
 * @typedef {Object} CollectedRaceData
 * @property {Array<ScrapedRaceStage>} stages - Array of race stages
 * @property {Array<ScrapedRaceTeam>} teams - Array of teams
 * @property {Array<ScrapedRaceRider>} riders - Array of riders
 *
 * @see ScrapedRaceStage
 * @see ScrapedRaceTeam
 * @see ScrapedRaceRider
 */

/**
 *
 * @param {string} racePcsID - ID of the race to scrape
 * @param {number} year - Year of the race to scrape
 * @returns {Promise<CollectedRaceData>} CollectedRaceData - Object containing stages, teams, and riders data
 */
async function collectRace(racePcsID, year) {
  /** @type {Array<ScrapedRaceStage>} */
  const stages = [];
  /** @type {Array<ScrapedRaceTeam>} */
  const teams = [];
  /** @type {Array<ScrapedRaceRider>} */
  const riders = [];

  if (!parseBool(process.env.FEATURE_DISABLED_STAGES, false)) {
    try {
      logOut("Scrape PCS - Race Stages", `${year} ${racePcsID}`);
      // Race stages
      const stagesInRace = await scrapeRaceStages(racePcsID, year);

      if (Array.isArray(stagesInRace) && stagesInRace.length > 0) {
        stages.push(...stagesInRace);
      } else {
        logError("Scrape PCS - Race Stages", "No stages found");
      }
    } catch (exception) {
      logError(
        "Scrape PCS - Race Stages",
        "Failed to collect race details",
        exception,
      );
    }
  } else {
    logOut("Main", "[FEATURE DISABLED] Stages", "warn");
  }

  if (!parseBool(process.env.FEATURE_DISABLED_STARTLIST, false)) {
    // Race start list - Teams and Riders
    logOut("Scrape PCS - Race Startlist", `${year} ${racePcsID}`);
    let raceStartlist;
    try {
      raceStartlist = await scrapeRaceStartList(racePcsID, year);
    } catch (exception) {
      logError(
        "Scrape PCS - Race Startlist",
        "Failed to collect startlist",
        exception,
      );
      throw exception;
    }

    if (Array.isArray(raceStartlist) && raceStartlist.length > 0) {
      const raceUID = generateId.race(racePcsID, year);
      // Add race and team to rider
      for (let team of raceStartlist) {
        // Add year
        teams.push({
          year,
          ...team,
        });
        // Add race and team to rider (transform to match RaceRiders/Riders CSV schemas)
        for (let rider of team.riders) {
          riders.push({
            raceUID,
            pcsId: rider.pcsId,
            teamPcsId: team.pcsId,
            bib: rider.bib,
            rider: `${rider.surname} ${rider.firstNames}`,
            flag: rider.flag,
            surname: rider.surname,
            firstNames: rider.firstNames,
            dateOfBirth: rider.dateOfBirth || "",
            nationality: rider.nationality || "",
          });
        }
      }
    } else {
      logError("Scrape PCS - Race Startlist", "No startlist found");
    }
  } else {
    logOut("Main", "[FEATURE DISABLED] Startlist", "warn");
  }

  return {
    stages: stages,
    teams: teams,
    riders: riders,
  };
}

/**
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {Array<RaceData>} races - The array of race IDs
 * @returns {Array<RaceWithStagesList>} - Array of RaceWithStages objects
 */
function stagesInRaces(raceStages, races) {
  /** @type {Array<RaceWithStagesList>} */
  const raceWithStages = [];
  for (const race of races) {
    raceWithStages.push({
      ...race,
      stages: raceStages.stagesInRace(race.raceUID),
    });
  }
  return raceWithStages;
}

/**
 *
 * @param {Races} races - The Races object
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {RaceStageResults} raceStageResults - The RaceStageResults object
 * @returns {Array<string>} - Array of RaceWithStages objects
 */
function stagesWithoutResults(races, raceStages, raceStageResults) {
  const today = new Date();
  const raceSeason = getSeason();

  const races_past = races.past(raceSeason);
  const races_inProgress = races.inProgress(today);
  // const races_upcoming = races.upcoming();
  const seasonRaces = stagesInRaces(raceStages, [
    ...races_past,
    ...races_inProgress,
  ]);

  return seasonRaces
    .flatMap((race) => race.stages)
    .filter((stage) => {
      const stageDate = new Date(stage.date);
      return (
        stageDate <= today &&
        raceStageResults.getStageRankings(stage.stageUID).length === 0
      );
    })
    .map((stage) => stage.stageUID);
}

/**
 * Collects past races.
 *
 * @async
 * @param {Races} races - The Races object.
 * @param {RaceStages} raceStages - The race stages.
 * @param {RaceRiders} raceRiders - The race riders.
 * @param {Riders} riders - The riders.
 * @param {Teams} teams - The teams.
 */
async function collectPastRaceDetails(
  races,
  raceStages,
  raceRiders,
  riders,
  teams,
) {
  logOut("Main", `Collecting past races details.`);
  const today = new Date();
  const pastRacesWithoutStages = stagesInRaces(raceStages, [
    ...races.past(),
    ...races.inProgress(today),
  ]).filter((race) => race.stages.length === 0);

  // TODO: -> We need all race data, not just past events
  // console.table(races.list())

  for (const race of pastRacesWithoutStages) {
    logOut("Main", `Collect past race: ${race.year} ${race.raceName}`);
    try {
      const raceDetails = await collectRace(race.racePcsID, race.year);
      await updateRace(raceDetails, raceStages, raceRiders, riders, teams);
    } catch (error) {
      logError(
        "Scrape PCS",
        `Failed to collect race details for ${race.raceName}`,
        error,
      );
    }
    logOut("Main", "Race information collection completed");
  }
}

/**
 * Updates race data by collecting and recording new races, stages, teams, and riders for the current season.
 *
 * @async
 * @param {CollectedRaceData} raceDetails - The race details.
 * @param {RaceStages} raceStages - The race stage
 * @param {RaceRiders} raceRiders - The race riders.
 * @param {Riders} riders - The Riders object.
 * @param {Teams} teams - The Teams object.
 */
async function updateRace(raceDetails, raceStages, raceRiders, riders, teams) {
  // Record stages in race
  await raceStages.update(raceDetails.stages);
  // Record teams in race
  await teams.update(
    raceDetails.teams.map((team) => ({
      year: team.year,
      pcsId: team.pcsId,
      pcsUrl: team.pcsUrl,
      jerseyImageUrl: team.jerseyImageUrl,
      name: team.name,
      classification: team.classification,
    })),
  );
  // Record riders in race
  await raceRiders.update(raceDetails.riders);
  // Record riders
  await riders.update(
    raceDetails.riders.map((raceRider) => {
      return {
        pcsId: raceRider.pcsId,
        surname: raceRider.surname,
        firstNames: raceRider.firstNames,
      };
    }),
  );
}

/**
 * Updates race data by collecting and recording new races, stages, teams, and riders for the current season.
 *
 * - If there are no races for the current season, collects them.
 * - For each past race with missing stages, fetches and updates detailed data.
 *
 * @async
 *
 * @param {Object} models - Object containing Races, RaceStages, RaceRiders data manager.
 * @returns {Promise<void>} Resolves when all updates are complete.
 * @throws {Error} If scraping or updating fails.
 *
 * @example
 * await updateRaces({ races, raceStages, raceRiders, riders, teams });
 */
async function updateRaces(models) {
  const raceSeason = getSeason();

  if (!parseBool(process.env.FEATURE_DISABLED_RACES, false)) {
    logOut("Main", `Collecting races for the ${raceSeason} season.`);
    try {
      await collectWorldTourRaces(models.races, raceSeason);
    } catch (error) {
      logError(
        "Main",
        `Failed to collect races for the ${raceSeason} season.`,
        error,
      );
    }
  } else {
    logOut("Main", "[FEATURE DISABLED] Races");
  }

  await collectPastRaceDetails(
    models.races,
    models.raceStages,
    models.raceRiders,
    models.riders,
    models.teams,
  );

  logOut("Main", `[TODO] Collecting future races details.`);
}

/**
 * Update stages logic here
 * @async
 * @param {Object} models - The models object containing all the data models
 * @param {Races} models.races - The Races object
 * @param {RaceStages} models.raceStages - The RaceStages object
 * @param {RaceStageResults} models.raceStageResults - The RaceStageResults object
 * @param {ClassificationGeneral} models.raceStageGeneral - The ClassificationGeneral object
 * @param {ClassificationPoints} models.raceStagePoints - The ClassificationPoints object
 * @param {ClassificationMountain} models.raceStageMountain - The ClassificationMountain object
 * @param {ClassificationYouth} models.raceStageYouth - The ClassificationYouth object
 * @param {ClassificationTeam} models.raceStageTeam - The ClassificationTeam object
 * @param {RaceStageLocationPoints} models.raceStageLocationPoints - The RaceStageLocationPoints object
 * @param {RaceStageLocationMountains} models.raceStageLocationMountains - The RaceStageLocationMountains object
 * @param {RaceStageLocationPointsResults} models.raceStageLocationPointsResults - The RaceStageLocationPointsResults object
 * @param {RaceStageLocationMountainsResults} models.raceStageLocationMountainsResults - The RaceStageLocationMountainsResults object
 */
async function updateStageResults(models) {
  logOut("Main", "Starting stage results collection");
  if (DEBUG_MEMORY) logMemoryUsage("StageResults-Start");

  const stagesRequireResults = stagesWithoutResults(
    models.races,
    models.raceStages,
    models.raceStageResults,
  );

  for (const stage of stagesRequireResults) {
    if (DEBUG_MEMORY) logMemoryUsage(`Before-Stage-${stage}`);

    const stageDetails = models.raceStages.getStage(stage);
    if (!stageDetails) {
      logOut(
        "Main",
        `Scrape Stage Results: Stage details not found for ${stage}`,
        "warn",
      );
      continue;
    }
    const [race] = stage.split(":");

    logOut(
      "Main",
      `Scrape Stage Results: ${stageDetails.year} ${race} Stage ${stageDetails.stage}`,
    );

    let stageResults;
    try {
      stageResults = await scrapeRaceStageResults(race, stageDetails);
      if (!stageResults) {
        logOut("Main", `Scrape Stage Results: No results found for ${stage}`);
        continue;
      }
      if (DEBUG_MEMORY) logMemoryUsage(`After-Scrape-${stage}`);
    } catch (error) {
      logError(
        "Main",
        `Scrape Stage Results Failed to collect results for ${stage}`,
        error,
      );
      continue;
    }

    // Write results immediately after each stage (streaming approach)
    if (!parseBool(process.env.FEATURE_DISABLED_RESULTS_UPDATE, false)) {
      // Phase 1: Write all classifications EXCEPT "stage" first
      // This ensures atomic-like behavior - stage is only marked complete
      // after all other classifications are successfully written
      for (let ranking in stageResults) {
        if (ranking === "stage") continue; // Skip stage - will write last

        switch (ranking) {
          case "gc":
            await models.raceStageGeneral.update(stageResults[ranking]);
            break;
          case "points":
            await models.raceStagePoints.update(stageResults[ranking]);
            break;
          case "youth":
            await models.raceStageYouth.update(stageResults[ranking]);
            break;
          case "teams":
            await models.raceStageTeam.update(stageResults[ranking]);
            break;
          case "kom":
          case "qom":
            await models.raceStageMountain.update(stageResults[ranking]);
            break;
          case "pointsLocations":
            await models.raceStageLocationPoints.update(stageResults[ranking]);
            break;
          case "komLocations":
          case "qomLocations":
            await models.raceStageLocationMountains.update(
              stageResults[ranking],
            );
            break;
          case "pointsLocationContest":
            await models.raceStageLocationPointsResults.update(
              stageResults[ranking],
            );
            break;
          case "komLocationContest":
          case "qomLocationContest":
            await models.raceStageLocationMountainsResults.update(
              stageResults[ranking],
            );
            break;
          // case "youthLocations":
          // case "teamsLocations":
          default:
            logOut(
              "Main",
              `Scrape Stage Results: Classification not yet recorded ${ranking}`,
            );
            break;
        }
      }

      // Phase 2: Only after all other classifications succeed, write "stage"
      // This marks the stage as complete in the tracking system
      if (stageResults["stage"]) {
        await models.raceStageResults.update(stageResults["stage"]);
      }

      // Write location-specific results (intermediate sprints and climbs)
      // if (stageResults["points"]?.today) {
      //   await models.raceStageLocationPoints.update(
      //     stageResults["points"].today,
      //   );
      // }
      // if (stageResults["kom"]?.today) {
      //   await models.raceStageLocationMountains.update(
      //     stageResults["kom"].today,
      //   );
      // }

      if (DEBUG_MEMORY) logMemoryUsage(`After-Write-${stage}`);
    } else {
      logOut("Main", "[FEATURE DISABLED] _RESULTS_UPDATE", "warn");
    }
  }

  logOut("Main", "Scrape Stage results collection completed");
  if (DEBUG_MEMORY) logMemoryUsage("StageResults-End");
}

/**
 * Main function to orchestrate the scraping process
 */
async function main() {
  try {
    // Data Models
    // TODO -> utilse dataService
    const models = {
      races: new Races(),
      raceStages: new RaceStages(),
      raceRiders: new RaceRiders(),
      teams: new Teams(),
      riders: new Riders(),
      raceStageResults: new RaceStageResults(),
      raceStageGeneral: new ClassificationGeneral(),
      raceStagePoints: new ClassificationPoints(),
      raceStageMountain: new ClassificationMountain(),
      raceStageYouth: new ClassificationYouth(),
      raceStageTeam: new ClassificationTeam(),
      raceStageLocationPoints: new RaceStageLocationPoints(),
      raceStageLocationMountains: new RaceStageLocationMountains(),
      raceStageLocationPointsResults: new RaceStageLocationPointsResults(),
      raceStageLocationMountainsResults:
        new RaceStageLocationMountainsResults(),
    };
    // Load data
    try {
      logOut("Main", "Loading data - Started");
      const loaded = await Promise.allSettled([
        models.races.read(),
        models.raceStages.read(),
        models.raceStageResults.read(),
        models.raceRiders.read(),
        models.teams.read(),
        models.riders.read(),
        models.raceStageGeneral.read(),
        models.raceStagePoints.read(),
        models.raceStageMountain.read(),
        models.raceStageYouth.read(),
        models.raceStageTeam.read(),
        models.raceStageLocationPoints.read(),
        models.raceStageLocationMountains.read(),
        models.raceStageLocationPointsResults.read(),
        models.raceStageLocationMountainsResults.read(),
      ]);

      const failures = loaded.filter((r) => r.status === "rejected");
      if (failures.length) {
        failures.forEach((r) =>
          logError("Main", r.reason?.message || String(r.reason)),
        );
        throw new Error("Loading data - Failed");
      }

      logOut("Main", "Loading data - Completed");
    } catch (error) {
      logError("Main", "Loading data - Failed", error);
      throw error;
    }

    try {
      await updateRaces(models);
    } catch (error) {
      logError("Main", "Collecting race information - Failed", error);
    }

    if (!parseBool(process.env.FEATURE_DISABLED_RESULTS, false)) {
      try {
        await updateStageResults(models);
      } catch (error) {
        logError("Main", "Collect race stage results - Failed", error);
      }
    } else {
      logOut("Main", "[FEATURE DISABLED] Update results", "warn");
    }
  } catch (error) {
    // Catch-all for any errors not handled above
    logError("Main", "Fatal error", error);
    throw error;
  }
}

try {
  await main();
} catch {
  process.exit(1);
}
