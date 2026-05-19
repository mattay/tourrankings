import { docopt } from "docopt";

/**
 * CLI Options for the scraper
 * @type {string}
 */
const DOC = `
Usage: scrape [options]

Options:
  -s, --season YEAR    Start scraping from YEAR (runs from YEAR to current year)
  -h, --help           Show this help message
`;

/**
 * Parse CLI arguments for the scraper
 * @returns {Object} Parsed CLI arguments
 */
function parseCliArgs() {
  const args = docopt(DOC);

  // Get start season from CLI args
  let startSeason = null;
  if (args["--season"]) {
    const year = parseInt(args["--season"], 10);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      startSeason = year;
    }
  }

  // Check for START_SEASON env var as alternative
  if (!startSeason && process.env.START_SEASON) {
    const year = parseInt(process.env.START_SEASON, 10);
    if (!isNaN(year) && year > 1900 && year < 2100) {
      startSeason = year;
    }
  }

  return { startSeason };
}

const cliArgs = parseCliArgs();

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
  ClassificationMountains,
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
import { parseBool, parseNumber } from "@utils/sanity";
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
 * @typedef {import('../models/@types/classifications').ClassificationMountainsModel} ClassificationMountainData
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
 *
 * @typedef {Object} ScrapedRaceRider
 * @property {String} raceUID - The ID of the race
 * @property {Number} year - The year of the race.
 * @property {String|null} riderPcsId - The ID of the rider on ProcyclingStats.
 * @property {String|null} teamPcsId - The ID of the riders team on ProcyclingStats.
 * @property {Number|null} bib - The bib Number of the rider.
 * @property {String|null} surname - The surname of the rider.
 * @property {String|null} firstNames - The first names of the rider.
 * @property {String|null} flag - The flag of the rider's country.
 * @property {String|null} dateOfBirth -
 * @property {String|null} nationality -
 * @property {String|null} pcsUrl - The URL of the rider on ProcyclingStats.
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
 * @param {string} [raceStartDate] - The race start date (ISO format: "YYYY-MM-DD") for TTL calculation.
 * @param {string} [raceEndDate] - The race end date (ISO format: "YYYY-MM-DD") for TTL calculation.
 * @param {boolean} [quiet=false] - Suppress expected errors for future races.
 * @returns {Promise<CollectedRaceData>} CollectedRaceData - Object containing stages, teams, and riders data
 */
async function collectRace(
  racePcsID,
  year,
  raceStartDate = null,
  raceEndDate = null,
  quiet = false,
) {
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
      const stagesInRace = await scrapeRaceStages(
        racePcsID,
        year,
        raceStartDate,
        raceEndDate,
        quiet,
      );

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
      raceStartlist = await scrapeRaceStartList(
        racePcsID,
        year,
        raceStartDate,
        raceEndDate,
        quiet,
      );
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
            riderPcsId: rider.pcsId,
            teamPcsId: team.pcsId,
            pcsUrl: rider.pcsUrl,
            bib: rider.bib,
            flag: rider.flag,
            surname: rider.surname,
            firstNames: rider.firstNames,
            year,
            dateOfBirth: "",
            nationality: "",
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
function stagesWithoutResults(races, raceStages, raceStageResults, year) {
  const today = new Date();
  const raceSeason = year !== undefined ? year : getSeason();
  const pollOffsetDays = parseNumber(process.env.RESULTS_POLL_START_OFFSET, 1);

  const races_past = races.past(raceSeason);
  const races_inProgress = races.inProgress(today);
  const seasonRaces = stagesInRaces(raceStages, [
    ...races_past,
    ...races_inProgress,
  ]);

  // Normalize today to midnight (ignore time)
  today.setHours(0, 0, 0, 0);

  return seasonRaces
    .flatMap((race) => race.stages)
    .filter((stage) => {
      const stageDate = new Date(stage.date);

      // Start polling 1 day before stage date
      const pollStartDate = new Date(stageDate);
      pollStartDate.setDate(pollStartDate.getDate() - pollOffsetDays);

      // Check if we should poll: today >= poll start date AND results not yet found
      const shouldPoll = today >= pollStartDate;
      const hasResults =
        raceStageResults.getStageRankings(stage.stageUID).length > 0;

      return shouldPoll && !hasResults;
    })
    .map((stage) => stage.stageUID);
}

/**
 * Helper function to collect race details for a batch of races with common options.
 *
 * @async
 * @param {Object} models - Object containing data models.
 * @param {RaceStages} models.raceStages - The race stages.
 * @param {RaceRiders} models.raceRiders - The race riders.
 * @param {Riders} models.riders - The riders.
 * @param {Teams} models.teams - The teams.
 * @param {Array} racesList - Array of race objects to process.
 * @param {Object} options - Options for this batch.
 * @param {Function} options.shouldCollect - Function that returns true if race should be collected.
 * @param {boolean} options.quiet - Whether to suppress expected errors.
 * @param {string} options.logPrefix - Prefix for log messages.
 */
async function collectRacesBatch(models, racesList, options) {
  const { raceStages, raceRiders, riders, teams } = models;
  const { shouldCollect, quiet, logPrefix } = options;
  const racesWithStages = stagesInRaces(raceStages, racesList);

  for (const race of racesWithStages) {
    if (!shouldCollect(race)) {
      continue;
    }

    logOut("Main", `${logPrefix}: ${race.year} ${race.raceName}`);

    try {
      const raceDetails = await collectRace(
        race.racePcsID,
        race.year,
        race.startDate,
        race.endDate,
        quiet,
      );
      await updateRace(
        raceDetails,
        raceStages,
        raceRiders,
        riders,
        teams,
        quiet,
      );
    } catch (error) {
      logError(
        "Scrape PCS",
        `Failed to collect race details for ${race.raceName}`,
        error,
      );
    }
  }
}

/**
 * Collects race details for all season races (past, in-progress, upcoming).
 * For upcoming races, details are always re-fetched to handle pre-race changes.
 * For past/in-progress races, only missing details are fetched.
 *
 * @async
 * @param {Object} models - Object containing data models.
 * @param {Races} models.races - The Races object.
 * @param {RaceStages} models.raceStages - The race stages.
 * @param {RaceRiders} models.raceRiders - The race riders.
 * @param {Riders} models.riders - The riders.
 * @param {Teams} models.teams - The teams.
 * @param {number} year - The season year to process.
 */
async function collectRaceDetails(models, year) {
  const today = new Date();
  const raceSeason = year !== undefined ? year : getSeason();
  const { races } = models;

  // 1. Past + In-Progress: Only collect if missing stages, quiet = false
  const pastAndInProgressRaces = [
    ...races.past(raceSeason),
    ...races.inProgress(today),
  ];
  await collectRacesBatch(models, pastAndInProgressRaces, {
    shouldCollect: (race) => race.stages.length === 0,
    quiet: false,
    logPrefix: "Collecting race details",
  });

  // 2. Upcoming: Always collect, quiet = true (suppress expected future race errors)
  const upcomingRaces = races
    .upcoming()
    .filter((race) => race.year === raceSeason);
  await collectRacesBatch(models, upcomingRaces, {
    shouldCollect: () => true,
    quiet: true,
    logPrefix: "Updating upcoming race",
  });

  logOut("Main", "Race information collection completed");
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
 * @param {boolean} [quiet=false] - Suppress expected errors for future races.
 */
async function updateRace(
  raceDetails,
  raceStages,
  raceRiders,
  riders,
  teams,
  quiet = false,
) {
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
  // Record riders in race (quiet mode suppresses console.table for validation errors)
  await raceRiders.update(raceDetails.riders, quiet);
  // Record riders
  await riders.update(
    raceDetails.riders.map((raceRider) => {
      return {
        riderPcsId: raceRider.riderPcsId,
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
async function updateRaces(models, year) {
  const raceSeason = year !== undefined ? year : getSeason();

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

  await collectRaceDetails(models, raceSeason);
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
async function updateStageResults(models, year) {
  logOut("Main", "Starting stage results collection");
  if (DEBUG_MEMORY) logMemoryUsage("StageResults-Start");

  const stagesRequireResults = stagesWithoutResults(
    models.races,
    models.raceStages,
    models.raceStageResults,
    year,
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
          case "mountains":
            await models.raceStageMountain.update(stageResults[ranking]);
            break;
          case "pointsLocations":
            await models.raceStageLocationPoints.update(stageResults[ranking]);
            break;
          case "mountainsLocations":
            await models.raceStageLocationMountains.update(
              stageResults[ranking],
            );
            break;
          case "pointsLocationContest":
            await models.raceStageLocationPointsResults.update(
              stageResults[ranking],
            );
            break;
          case "mountainsLocationContest":
            await models.raceStageLocationMountainsResults.update(
              stageResults[ranking],
            );
            break;
          case "youthLocationContest":
          case "teamsLocationContest":
            // Ignore for now
            break;
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
      raceStageMountain: new ClassificationMountains(),
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

    // Determine years to process
    const currentYear = new Date().getFullYear();
    const startYear = cliArgs.startSeason || currentYear;
    const years = [];

    if (cliArgs.startSeason) {
      // Range: from startYear to current year
      for (let year = startYear; year <= currentYear; year++) {
        years.push(year);
      }
      logOut("Main", `Processing years: ${startYear} to ${currentYear}`);
    } else {
      // Single year: just current year
      years.push(currentYear);
    }

    // Process each year
    for (const year of years) {
      getSeason(year); // Set the year for this iteration

      try {
        await updateRaces(models, year);
      } catch (error) {
        logError(
          "Main",
          `Collecting race information - Failed for year ${year}`,
          error,
        );
      }

      if (!parseBool(process.env.FEATURE_DISABLED_RESULTS, false)) {
        try {
          await updateStageResults(models, year);
        } catch (error) {
          logError(
            "Main",
            `Collect race stage results - Failed for year ${year}`,
            error,
          );
        }
      } else {
        logOut("Main", "[FEATURE DISABLED] Update results", "warn");
      }
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
