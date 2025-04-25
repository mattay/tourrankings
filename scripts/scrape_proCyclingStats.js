import puppeteer, { Page } from "puppeteer";
// Data Models
import RaceRiders from "../src/models/race_riders/race_riders";
import RaceStageResults from "../src/models/race_stages/race_stage_results";
import RaceStages from "../src/models/race_stages/race_stages";
import Races from "../src/models/races/races";
import Teams from "../src/models/teams/teams";
// Utils
import { generateId } from "../src/utils/idGenerator";
import { logError, logOut } from "../src/utils/logging";
// Scrape
import config from "./scrape_proCyclingStats/config";
import { interceptRequests } from "./scrape_proCyclingStats/page_proCyclingStats";
import { scrapeStages } from "./scrape_proCyclingStats/race_stages";
import { scrapeRaceStartList } from "./scrape_proCyclingStats/race_startList";
import { collectWorldTourRaces } from "./scrape_proCyclingStats/races";
// import { buildUrl } from "../src/utils/url";

/**
 * @typedef {import('../src/models/races/races').RaceData} RaceData
 * @typedef {import('../src/models/race_stages/race_stages').RaceStageData} RaceStageData
 * @typedef {RaceData & { stages: Array<RaceStageData> }} RaceWithStages
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
 * Update Races logic here
 * @param {Page} page - The Puppeteer page object
 * @param {Races} races - The Races object
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
