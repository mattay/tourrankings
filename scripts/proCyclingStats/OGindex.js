import puppeteer, { Page } from "puppeteer";
// Data models
import GeneralClassification from "../src/models/race_rankings/general_classification.js";
import PointsClassification from "../src/models/race_rankings/points_classification.js";
import StageResults from "../src/models/race_rankings/stage_results.js";
import TeamClassifcation from "../src/models/race_rankings/team_classification.js";
import TomClassification from "../src/models/race_rankings/tom_classification.js";
import YouthClassification from "../src/models/race_rankings/youth_classification.js";
import RaceRiders from "../src/models/race_riders/race_riders.js";
import RaceStages from "../src/models/race_stages/race_stages.js";
import Races from "../src/models/races/races.js";
import Teams from "../src/models/teams/teams.js";
// Scrape
import { scrapeStages } from "./race_stages.js";
import { scrapeRaceStartList } from "./race_startList.js";
import { scrapeRaces } from "./races.js";
import { srapeStageResults } from "./stage_results.js";
// Utils
import { generateId } from "../src/utils/idGenerator.js";
import { buildUrl } from "../src/utils/url.js";
import { randomFromRange, sleep } from "../src/utils/utils.js";

const TESTING = false;
const WAIT = 420;

/**
 *
 * @param {Races} races
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
 * @param {Races} races
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
 * @param {Races} races
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
 * @param {Page} page
 * @param {Races} race
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

async function main() {
  // Bowser Setup
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // let year = 2024;
  const season = process.env.SEASON || null;
  const currentYear = new Date().getFullYear();
  const races = new Races();
  const raceStages = new RaceStages();

  // console.log("season", season);

  let racesToScrape = [
    // "giro-d-italia",
    // "tour-de-france",
    // "tour-down-under",
  ];

  try {
    for (const raceCode of racesToScrape) {
      const [raceUrlId, raceSeason] = raceCode.split(":");
      await collectRace(page, raceUrlId, raceSeason);

      // Race stages and startlist
      const raceID = [raceCode, season].join("-");
      const stages = await raceStages.stagesInRace(raceID);

      // Stages in Race
      for (const stageDeatails of stages) {
        await collectRaceStageResults(
          page,
          raceCode,
          season,
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
