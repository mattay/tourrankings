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
 */
async function collectRace(page, raceId, year) {
  const stages = []; //new RaceStages();
  const teams = []; //new Teams();
  const riders = []; //new RaceRiders();

  try {
    // Stages
    logOut("Scraping -> Stages", `${raceId}, ${year}`, "debug");
    const stagesInRace = await scrapeStages(page, raceId, year).catch(
      (exception) => logError("Scrape Stages", exception),
    );

    if (stagesInRace) {
      stages.push(...stagesInRace);
    } else {
      logError("CollectRace", "No stages found");
    }

    // Start List - Teams and Riders
    logOut("Scraping -> StartList", `${raceId}, ${year}`, "debug");
    const raceStartlist = await scrapeRaceStartList(page, raceId, year).catch(
      (exception) => logError("Scrape StartList", exception),
    );

    if (raceStartlist) {
      const updatesTeams = [];
      const updatesRiders = [];
      for (let team of raceStartlist) {
        updatesTeams.push({
          year,
          ...team,
        });

        for (let rider of team.riders) {
          updatesRiders.push({
            raceId: generateId.race(raceId, year),
            teamId: team.teamId,
            ...rider,
          });
        }
      }
      teams.push(...updatesTeams);
      riders.push(...updatesRiders);
    } else {
      logError("CollectRace", "No startlist found");
    }
  } catch (exception) {
    logError("CollectRace", exception);
    logOut("CollectRace", `${raceId}, ${year}`);
  }
  return {
    stages,
    teams,
    riders,
  };
}

/**
 *
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {Array<RaceData>} raceIds - The array of race IDs
 * @returns {Array<RaceWithStages>}
 */
function stagesInRaces(raceStages, races) {
  for (const race of races) {
    race.stages = raceStages.stagesInRace(race.raceId);
  }
  return races;
}

/**
 *
 * @param {Races} races - The Races object
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {RaceStageResults} raceStageResults - The RaceStageResults object
 * @returns {Array<RaceWithStages>}
 */
function stagesWithoutResults(races, raceStages, raceStageResults) {
  const today = new Date("2025/01/22");
  const raceSeason = today.getFullYear();
  console.log(raceSeason, today);

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
async function updateRaces(page, races, raceStages) {
  const today = new Date("2020");
  const raceSeason = today.getFullYear() + 1;

  // let seasonRaces = ;
  if (!races.season(raceSeason)) {
    logOut("Update Races", `Collecting races for the ${raceSeason} season.`);
    try {
      await collectWorldTourRaces(races, raceSeason, page);
    } catch (error) {
      logError("Update Races", error);
    }
  }

  const pastRaces = stagesInRaces(raceStages, races.past()).filter(
    (race) => race.stages.length === 0,
  );
  for (const race of pastRaces) {
    console.log(
      " ",
      race.startDate,
      "->",
      race.endDate,
      race.raceName,
      race.year,
      race.raceId,
    );
    const { stages, teams, riders } = await collectRace(
      page,
      race.raceUrlId,
      race.year,
    );
    console.table(stages);
    console.table(teams);

    // await stages.update(stagesInRace);
    // await teams.update(updatesTeams);
    // await riders.update(updatesRiders);
    // for (const stage of stages) {
    //   logOut("Collecting Stages", `${stage.stage} - ${stage.stageId} for ${stage.}`);
    //   // await collectStage(page, stage.stageId, stage.stageUrlId, stage.year);
    // }
  }

  // console.log(pastRaces);
}

/**
 * Update stages logic here
 * @prop {Page} page - The Puppeteer page object
 * @param {Races} races - The Races object
 * @param {RaceStages} raceStages - The RaceStages object
 * @param {RaceStageResults} raceStageResults - The RaceStageResults object
 */
async function updateStages(page, races, raceStages, raceStageResults) {
  const stagesRequireResults = stagesWithoutResults(
    races,
    raceStages,
    raceStageResults,
  );
  console.log("stagesRequireResults", stagesRequireResults);
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
