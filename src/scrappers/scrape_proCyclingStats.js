import puppeteer from "puppeteer-core";

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
} from "../models";
// Utils
import { generateId } from "../utils/idGenerator";
import { logError, logOut } from "../utils/logging";
// Scrape
import {
  config,
  interceptRequests,
  collectWorldTourRaces,
  scrapeRaceStartList,
  scrapeRaceStages,
  scrapeRaceStageResults,
} from "./source/proCyclingStats";

/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 */

/**
 * Models
 * @typedef {import('../models/@types/races').RaceModel} RaceData
 * @typedef {import('../models/@types/races').RaceStageModel} RaceStageData
 * @typedef {import('../models/@types/teams').TeamModel} TeamData
 * @typedef {import('../models/@types/riders').RiderModel} RiderData
 * @typedef {import('../models/@types/classifications').ClassificationGeneralModel} ClassificationGeneralModel
 * @typedef {import('../models/@types/classifications').ClassificationYouthModel} ClassificationYouthData
 * @typedef {import('../models/@types/classifications').ClassificationPointModel} ClassificationPointData
 * @typedef {import('../models/@types/classifications').ClassificationMountainModel} ClassificationMountainData
 * @typedef {import('../models/@types/classifications').ClassificationTeamModel} ClassificationTeamData
 */

/**
 * @typedef {RaceData & { raceStages: Array<RaceStageData>, raceTeams: Array<TeamData>, raceRiders: Array<RiderData> }} RaceWithStages
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
 * @param {Page} page - Page object from Puppeteer
 * @param {string} racePcsID - ID of the race to scrape
 * @param {number} year - Year of the race to scrape
 * @returns {Promise<CollectedRaceData>} CollectedRaceData - Object containing stages, teams, and riders data
 */
async function collectRace(page, racePcsID, year) {
  /** @type {Array<ScrapedRaceStage>} */
  const stages = [];
  /** @type {Array<ScrapedRaceTeam>} */
  const teams = [];
  /** @type {Array<ScrapedRaceRider>} */
  const riders = [];

  try {
    logOut("CollectRace", `${racePcsID}, ${year}`);
    // Race stages
    const stagesInRace = await scrapeRaceStages(page, racePcsID, year).catch(
      (exception) => {
        logError("CollectRace", `Failed to collect stages`, exception);
      },
    );
    if (stagesInRace) {
      stages.push(...stagesInRace);
    } else {
      logError("CollectRace", "No stages found");
    }

    // Race start list - Teams and Riders
    const raceStartlist = await scrapeRaceStartList(
      page,
      racePcsID,
      year,
    ).catch((exception) => {
      logError("CollectRace", `Failed to collect startlist`, exception);
    });
    if (raceStartlist) {
      for (let team of raceStartlist) {
        // Add year
        teams.push({
          year,
          ...team,
        });
        // Add race and team to rider
        for (let rider of team.riders) {
          riders.push({
            raceUID: generateId.race(racePcsID, year),
            teamPcsId: team.teamPcsId,
            ...rider,
          });
        }
      }
    } else {
      logError("CollectRace", "No startlist found");
    }
  } catch (exception) {
    logError("CollectRace", "Failed to collect race details", exception);
  }

  return {
    stages: stages,
    teams: teams,
    riders: riders,
  };
}

/**
 *
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {Array<RaceData>} races - The array of race IDs
 * @returns {Array<RaceWithStages>} - Array of RaceWithStages objects
 */
function stagesInRaces(raceStages, races) {
  for (const race of races) {
    race.stages = raceStages.stagesInRace(race.raceUID);
  }
  return races;
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
  const raceSeason = today.getFullYear();

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
        raceStageResults.getStageResults(stage.stageUID).length === 0
      );
    })
    .map((stage) => stage.stageUID);
}

/**
 * Collects races for the current season.
 *
 * @async
 * @param {Page} page - Puppeteer page instance for scraping.
 * @param {Races} races - The Races object.
 * @param {number} raceSeason - The season for which to collect races.
 */
async function collectSeasonRaces(page, races, raceSeason) {
  logOut(
    "collectSeasonRaces",
    `Collecting races for the ${raceSeason} season.`,
  );
  try {
    await collectWorldTourRaces(page, races, raceSeason);
  } catch (error) {
    logError(
      "collectSeasonRaces",
      `Failed to collect races for the ${raceSeason} season.`,
      error,
    );
  }
}

/**
 * Collects past races.
 *
 * @async
 * @param {Page} page - Puppeteer page instance for scraping.
 * @param {Races} races - The Races object.
 * @param {RaceStages} raceStages - The race stages.
 * @param {RaceRiders} raceRiders - The race riders.
 * @param {Riders} riders - The riders.
 * @param {Teams} teams - The teams.
 */
async function collectPastRaceDetails(
  page,
  races,
  raceStages,
  raceRiders,
  riders,
  teams,
) {
  const today = new Date();
  const pastRacesWithoutStages = stagesInRaces(raceStages, [
    ...races.past(),
    ...races.inProgress(today),
  ]).filter((race) => race.stages.length === 0);

  for (const race of pastRacesWithoutStages) {
    logOut("collectPastRaces", `${race.raceName}`);
    try {
      const raceDetails = await collectRace(page, race.racePcsID, race.year);
      await updateRace(raceDetails, raceStages, raceRiders, riders, teams);
    } catch (error) {
      logError(
        "collectPastRaces",
        `Failed to collect race details for ${race.name}`,
        error,
      );
    }
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
      teamName: team.teamName,
      teamPcsUrl: team.teamPcsUrl,
      jerseyImageUrl: team.jerseyImageUrl,
      teamPcsId: team.teamPcsId,
      teamClassification: team.teamClassification,
    })),
  );
  // Record riders in race
  await raceRiders.update(raceDetails.riders);
  // Record riders
  await riders.update(
    raceDetails.riders.map((raceRider) => {
      return {
        riderPcsId: raceRider.riderPcsId,
        riderName: raceRider.rider,
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
 * @param {Page} page - Puppeteer page instance for scraping.
 * @param {Races} races - Races data manager.
 * @param {RaceStages} raceStages - RaceStages data manager.
 * @param {RaceRiders} raceRiders - RaceRiders data manager.
 * @param {Riders} riders - Riders data manager.
 * @param {Teams} teams - Teams data manager.
 * @returns {Promise<void>} Resolves when all updates are complete.
 * @throws {Error} If scraping or updating fails.
 *
 * @example
 * await updateRaces(page, races, raceStages, raceRiders, riders, teams);
 */
async function updateRaces(page, races, raceStages, raceRiders, riders, teams) {
  const today = new Date();
  const raceSeason = today.getFullYear();

  await collectSeasonRaces(page, races, raceSeason);
  await collectPastRaceDetails(
    page,
    races,
    raceStages,
    raceRiders,
    riders,
    teams,
  );
}

/**
 * Update stages logic here
 * @prop {Page} page - The Puppeteer page object
 * @param {Races} races - The Races object
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {RaceStageResults} raceStageResults - The RaceStageResults object
 * @param {ClassificationGeneral} raceStageGeneral -
 * @param {ClassificationPoints} raceStagePoints -
 * @param {ClassificationMountain} raceStageMountain -
 * @param {ClassificationYouth} raceStageYouth -
 * @param {ClassificationTeam} raceStageTeam -
 */
async function updateStageResults(
  page,
  races,
  raceStages,
  raceStageResults,
  raceStageGeneral,
  raceStagePoints,
  raceStageMountain,
  raceStageYouth,
  raceStageTeam,
) {
  const stagesRequireResults = stagesWithoutResults(
    races,
    raceStages,
    raceStageResults,
  );

  const raceResults = {
    stage: [],
    gc: [],
    points: [],
    mountain: [],
    youth: [],
    teams: [],
  };

  for (const stage of stagesRequireResults) {
    const [race, year, stageNo] = stage.split(":");
    logOut(
      "Update Stage Results",
      `Scraping -> Stage Results, ${race}, ${year}, ${stage}`,
    );
    try {
      const stageResults = await scrapeRaceStageResults(
        page,
        race,
        Number(year),
        Number(stageNo),
      );
      // Collect Results for bulk update
      for (let ranking in stageResults) {
        switch (ranking) {
          case "stage":
          case "gc":
          case "points":
          case "youth":
          case "teams":
            raceResults[ranking].push(...stageResults[ranking]);
            break;
          case "kom":
          case "qom":
            raceResults["mountain"].push(...stageResults[ranking]);
            break;
          default:
            logOut(
              "Update Stage Results",
              `Classification not yet recorded ${ranking}`,
            );
            break;
        }
      }
    } catch (error) {
      logError(
        "Update Stage Results",
        `Failed to collect stage results for ${stage}`,
        error,
      );
    }
  }
  await raceStageResults.update(raceResults.stage);
  await raceStageGeneral.update(raceResults.gc);
  await raceStagePoints.update(raceResults.points);
  await raceStageMountain.update(raceResults.mountain);
  await raceStageYouth.update(raceResults.youth);
  await raceStageTeam.update(raceResults.teams);
}

/**
 * Main function to orchestrate the scraping process
 */
async function main() {
  // Bowser Setup
  let browser;
  try {
    browser = await puppeteer.launch(config.browser);

    // Page Setup
    const page = await browser.newPage();
    page.setRequestInterception(true);
    page.on("request", interceptRequests);

    // Data Models
    // TODO utilse dataService
    const races = new Races();
    const raceStages = new RaceStages();
    const raceRiders = new RaceRiders();
    const teams = new Teams();
    const riders = new Riders();
    const raceStageResults = new RaceStageResults();
    const raceStageGeneral = new ClassificationGeneral();
    const raceStagePoints = new ClassificationPoints();
    const raceStageMountain = new ClassificationMountain();
    const raceStageYouth = new ClassificationYouth();
    const raceStageTeam = new ClassificationTeam();

    // Load data
    try {
      await races.read();
      await raceStages.read();
      await raceStageResults.read();
      await raceRiders.read();
      await teams.read();
      await riders.read();
      await raceStageGeneral.read();
      await raceStagePoints.read();
      await raceStageMountain.read();
      await raceStageYouth.read();
      await raceStageTeam.read();
    } catch (error) {
      logError("Main", "Loading data", error);
      throw error;
    }

    try {
      await updateRaces(page, races, raceStages, raceRiders, riders, teams);
    } catch (error) {
      logError("Main", "Collecting race information", error);
    }

    try {
      await updateStageResults(
        page,
        races,
        raceStages,
        raceStageResults,
        raceStageGeneral,
        raceStagePoints,
        raceStageMountain,
        raceStageYouth,
        raceStageTeam,
      );
    } catch (error) {
      logError("Main", "Failed to collect race information", error);
    }
  } catch (error) {
    // Catch-all for any errors not handled above
    logError("Main", "Fatal error in main", error);

    // if (error instanceof Error) {
    // if (err instanceof puppeteer.errors.TimeoutError) {
    // logError("PUPPETEER_EXECUTABLE_PATH", Bun.env.PUPPETEER_EXECUTABLE_PATH);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

await main();
