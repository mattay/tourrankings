import puppeteer from "puppeteer";

// Data models
import Race from "../races/races.js";
import RaceStages from "../race_stages/race_stages.js";
import RaceRiders from "../race_riders/race_riders.js";
import Teams from "../teams/teams.js";
// Scrape
import { scrapeStages } from "./race_stages.js";
import { scrapeRaces } from "./races.js";
import { scrapeRaceStartList } from "./race_startList.js";
// Utils
import { buildUrl } from "../utils/url.js";
import { srapeStage } from "./stage.js";
import { randomFromRange, sleep } from "../utils/utils.js";

const HEADLESS = false;
const TESTING = true;
const WAIT = 420;

async function pastRaces(races) {
  const pastRaces = await races.past();
  if (pastRaces) {
    console.log("Past Races");
    pastRaces.forEach((race) => {
      console.log(" ", race.startDate, "->", race.endDate, race.raceName);
    });
  }
}

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

async function futureRaces(races) {
  const upcoming = await races.upcoming();
  if (upcoming) {
    console.log("Upcoming Races");
    upcoming.forEach((race) => {
      console.log(" ", race.startDate, "->", race.endDate, race.raceName);
    });
  }
}

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
  console.log("Scraping -> Races", "World Tour");
  const tableRows = await scrapeRaces(page, url, filter.year);

  console.log("Updating -> Races");
  await races.update(tableRows);
  console.table(await races.read());
}

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
            raceId: raceId,
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

async function collectRaceStage(page, race, year, stage) {
  // https://www.procyclingstats.com/race/tour-de-france/2024/stage-1
  await srapeStage(page, race, year, stage);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: HEADLESS,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  page.setRequestInterception(true);

  const requestSummary = {};

  page.on("request", (request) => {
    const url = new URL(request.url());
    const domain = url.hostname;

    if (
      // Whitelist
      [
        "www.procyclingstats.com",
        "ajax.googleapis.com",
        "code.jquery.com",
      ].includes(domain)
    ) {
      request.continue();
    } else {
      requestSummary[domain] = (requestSummary[domain] || 0) + 1;
      request.abort();
    }
  });

  // const url =
  //   "https://www.procyclingstats.com/race/tour-de-france/2024/stage-1";
  // await page.goto(url);
  // sleep(randomFromRange(WAIT * 3, WAIT * 10));

  const year = 2024;
  const races = new Race();
  const raceStages = new RaceStages();
  // const stage = new raceStage

  if (!TESTING) {
    await collectWorldTourRaces(races, year, page);
    currentRaces(races);
  }

  const racesToScrape = [
    // "giro-d-italia",
    "tour-de-france",
  ];

  try {
    for (const raceCode of racesToScrape) {
      if (!TESTING) {
        // Race
        await collectRace(page, raceCode, year);
      }

      // Race stages and startlist
      const raceID = [raceCode, year].join("-");
      const stages = await raceStages.stagesInRace(raceID);
      // Stages in Race
      for (const stage of stages) {
        await collectRaceStage(page, raceCode, year, +stage.stage + 1);
        // console.log(stage);
        //
        console.log("Sleepy Time");
        sleep(randomFromRange(WAIT, WAIT * 3));
        break;
      }
    }
  } catch (exception) {
    console.error(exception.name, exception.message);
  }

  console.log("Requests", Object.keys(requestSummary));

  await browser.close();
}

await main();
