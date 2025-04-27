import puppeteer, { Page } from "puppeteer";
// Data Models
import {
  Races,
  RaceStages,
  RaceStageResults,
  RaceRiders,
  Teams,
  Riders,
  // GeneralClassification,
  // PointsClassification,
  // MountainClassification,
  // YouthClassification,
  // TeamClassification,
} from "../src/models/";
// Utils
import { generateId } from "../src/utils/idGenerator";
import { logError, logOut } from "../src/utils/logging";
// Scrape
import {
  config,
  interceptRequests,
  collectWorldTourRaces,
  scrapeRaceStartList,
  scrapeRaceStages,
} from "./proCyclingStats";

/**
 * Classes
 * @typedef {import('../src/models/races/races').RaceData} RaceData
 * @typedef {import('../src/models/raceStages/raceStages').RaceStageData} RaceStageData
 * @typedef {import('../src/models/teams/teams').TeamData} TeamData
 * @typedef {import('../src/models/riders/riders').RiderData} RiderData
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
 * @param {string} raceId - ID of the race to scrape
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
        logError("CollectRace", `Error collecting stages`);
        logError("CollectRace", exception);
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
      logError("CollectRace", `Error collecting startlist`);
      logError("CollectRace", exception);
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
    logError("CollectRace", exception);
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
 * @returns {Array<RaceWithStages>} - Array of RaceWithStages objects
 */
function stagesWithoutResults(races, raceStages, raceStageResults) {
  const today = new Date();
  const raceSeason = today.getFullYear();

  const races_past = races.past(raceSeason);
  const races_inProgress = races.inProgress(today);
  const races_upcoming = races.upcoming();
  const seasonRaces = stagesInRaces(raceStages, races_inProgress);
  //
  return seasonRaces
    .flatMap((race) => race.stages)
    .filter((stage) => {
      const stageDate = new Date(stage.date);
      return (
        stageDate <= today &&
        raceStageResults.getStageResults(stage.stageId).length === 0
      );
    })
    .map((stage) => stage.stageId);
}

/**
 * Updates race data by collecting and recording new races, stages, teams, and riders for the current season.
 *
 * - If there are no races for the current season, collects them.
 * - For each past race with missing stages, fetches and updates detailed data.
 *
 * @async
 * @param {import('puppeteer').Page} page - Puppeteer page instance for scraping. * @param {Races} races - The Races object
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

  if (races.season(raceSeason).length == 0) {
    logOut("Update Races", `Collecting races for the ${raceSeason} season.`);
    try {
      await collectWorldTourRaces(page, races, raceSeason);
    } catch (error) {
      logError("Update Races", error);
    }
  }

  const pastRaces = stagesInRaces(raceStages, races.past()).filter(
    (race) => race.stages.length === 0,
  );
  for (const race of pastRaces) {
    try {
      const raceDetails = await collectRace(page, race.racePcsID, race.year);
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
    } catch (error) {
      logError("Update Races", error);
    }
  }
}

/**
 * Update stages logic here
 * @prop {Page} page - The Puppeteer page object
 * @param {Races} races - The Races object
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {RaceStageResults} raceStageResults - The RaceStageResults object
 */
async function updateStageResults(page, races, raceStages, raceStageResults) {
  const stagesRequireResults = stagesWithoutResults(
    races,
    raceStages,
    raceStageResults,
  );
}

/**
 * Main function to orchestrate the scraping process
 */
async function main() {
  // Bowser Setup
  const browser = await puppeteer.launch(config.browser);
  // Page Setup
  const page = await browser.newPage();
  page.setRequestInterception(true);
  page.on("request", interceptRequests);

  // Data Models
  const races = new Races();
  const raceStages = new RaceStages();
  const raceStageResults = new RaceStageResults();
  // Load data
  await races.read();
  await raceStages.read();
  await raceStageResults.read();

  await updateRaces(page, races, raceStages);
  await updateStages(page, races, raceStages, raceStageResults);

  await browser.close();
}

await main();
