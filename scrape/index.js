import puppeteer from "puppeteer";
import { Page } from "puppeteer";

// Data models
import Teams from "../models/teams/teams.js";
import Race from "../models/races/races.js";
import RaceStages from "../models/race_stages/race_stages.js";
import RaceRiders from "../models/race_riders/race_riders.js";
import StageResults from "../models/race_rankings/stage_results.js";
import GeneralClassification from "../models/race_rankings/general_classification.js";
import PointsClassification from "../models/race_rankings/points_classification.js";
import TomClassification from "../models/race_rankings/tom_classification.js";
import YouthClassification from "../models/race_rankings/youth_classification.js";
import TeamClassifcation from "../models/race_rankings/team_classification.js";

// Scrape
import { scrapeRaces } from "./races.js";
import { scrapeRaceStartList } from "./race_startList.js";
import { scrapeStages } from "./race_stages.js";
import { srapeStageResults } from "./stage_results.js";
// Utils
import { buildUrl } from "../utils/url.js";
import { randomFromRange, sleep } from "../utils/utils.js";
import { generateId } from "../utils/idGenerator.js";

const HEADLESS = true;
const TESTING = false;
const WAIT = 420;

/**
 *
 * @param {Race} races
 */
async function pastRaces(races) {
  const pastRaces = await races.past();
  if (pastRaces) {
    console.log("Past Races");
    pastRaces.forEach((race) => {
      console.log(" ", race.startDate, "->", race.endDate, race.raceName);
    });
  }
}

/**
 *
 * @param {Race} races
 */
async function currentRaces(races) {
  const currentRaces = await races.inProgress();
  if (currentRaces) {
    console.log("Current Races");

    currentRaces.forEach((race) => {
      console.log(
        " ",
        race.startDate,
        "->",
        race.endDate,
        race.raceName,
        race.year,
        race.raceId,
      );
    });
  }
}

/**
 *
 * @param {Race} races
 */
async function futureRaces(races) {
  const upcoming = await races.upcoming();
  if (upcoming) {
    console.log("Upcoming Races");
    upcoming.forEach((race) => {
      console.log(" ", race.startDate, "->", race.endDate, race.raceName);
    });
  }
}

/**
 *
 * @param {Race} races
 * @param {number} year
 * @param {Page} page
 */
async function collectWorldTourRaces(races, year, page) {
  const filter = {
    year: year,
    circuit: 1,
    class: "2.UWT",
    filter: "Filter",
    p: "uci",
    s: "year-calendar",
  };

  // const races = new Race();
  // console.table(await races.read());

  const url = buildUrl("https://www.procyclingstats.com/races.php", filter);

  const tableRows = await scrapeRaces(page, url, filter.year);
  await races.update(tableRows);
}

/**
 *
 * @param {Page} page
 * @param {string} raceId
 * @param {number} year
 */
async function collectRace(page, raceId, year) {
  try {
    // Check for races
    const stages = new RaceStages();
    const teams = new Teams();
    const riders = new RaceRiders();

    // Stages
    await stages.read();
    console.log("Scraping -> Stages", raceId, year);
    const stagesInRace = await scrapeStages(page, raceId, year).catch(
      (exception) => console.error(exception.name, exception.message),
    );
    if (stagesInRace) {
      console.log("Updating -> Stages", raceId, year);
      await stages.update(stagesInRace);
    }

    // Start List
    await teams.read();
    console.log("Scraping -> StartList", raceId, year);
    const raceStartlist = await scrapeRaceStartList(page, raceId, year).catch(
      (exception) => console.error(exception),
    );
    if (raceStartlist) {
      console.log("Updating -> StartList", raceId, year);
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
      await teams.update(updatesTeams);
      await riders.update(updatesRiders);
    }
  } catch (exception) {
    console.error(exception.name, exception.message);
  }
}

/**
 *
 * @param {Page} page
 * @param {Race} race
 * @param {number} year
 * @param {string} stage
 */
async function collectRaceStageResults(page, race, year, stage) {
  const stageResults = new StageResults();
  const stageGC = new GeneralClassification();
  const stagePoints = new PointsClassification();
  const stageTom = new TomClassification();
  const stageYouth = new YouthClassification();
  const stageTeam = new TeamClassifcation();

  // https://www.procyclingstats.com/race/tour-de-france/2024/stage-1
  console.log("Scraping -> Stage Results", race, year, stage);
  const stageData = await srapeStageResults(page, race, year, stage);

  for (let ranking in stageData) {
    switch (ranking) {
      case "stage":
        await stageResults.update(stageData[ranking]);
        break;

      case "gc":
        await stageGC.update(stageData[ranking]);
        break;

      case "points":
        await stagePoints.update(stageData[ranking]);
        break;

      case "kom":
      case "qom":
        await stageTom.update(stageData[ranking]);
        break;

      case "youth":
        await stageYouth.update(stageData[ranking]);
        break;

      case "teams":
        await stageTeam.update(stageData[ranking]);
        break;

      default:
        console.log(ranking);
        console.log(stageData[ranking][0]);
        // console.table(stageResults[ranking]);
        break;
    }
  }
}

/**
 *
 * @param {Handler<HTTPRequest} request
 */
function interceptRequests(request) {
  const url = new URL(request.url());
  const domain = url.hostname;

  if (WhitelistDomains.includes(domain)) {
    request.continue();
  } else {
    request.abort();
  }
}

const WhitelistDomains = [
  "www.procyclingstats.com",
  "ajax.googleapis.com",
  "code.jquery.com",
];

async function main() {
  // Bowser Setup
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  page.setRequestInterception(true);
  page.on("request", interceptRequests);

  const year = 2024;
  const currentYear = new Date().getFullYear();
  const races = new Race();
  const raceStages = new RaceStages();

  if (!TESTING) {
    console.log("collectWorldTourRaces");
    await collectWorldTourRaces(races, year, page);
    console.log("currentRaces");
    currentRaces(races);
  }

  const racesToScrape = [
    // "giro-d-italia",
    // "tour-de-france",
    "tour-down-under",
  ];

  try {
    for (const raceCode of racesToScrape) {
      await collectRace(page, raceCode, year);
      //     if (!TESTING) {
      //       // Race
      //       await collectRace(page, raceCode, year);
      //     }

      // Race stages and startlist
      const raceID = [raceCode, year].join("-");
      const stages = await raceStages.stagesInRace(raceID);

      // Stages in Race
      for (const stageDeatails of stages) {
        await collectRaceStageResults(
          page,
          raceCode,
          year,
          +stageDeatails.stage,
        );

        sleep(randomFromRange(WAIT, WAIT * 3));
      }
    }
  } catch (exception) {
    console.error(exception.name, exception.message);
  }

  await browser.close();
}

await main();
