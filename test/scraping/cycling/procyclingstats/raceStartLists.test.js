import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { scrapeRaceStartListFromHtml } from "src/scrappers/source/proCyclingStats/raceStartList";
import { Teams } from "src/models/teams";
import { Riders } from "src/models/riders";
import { RaceRiders } from "src/models/raceRiders";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for both HTML parsing and CSV output tests
const STARTLIST_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    html: "test/scraping/cycling/procyclingstats/html/raceStartlist-2025-tour-down-under.html",
    startlist: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStartList-2025-tour-down-under.csv",
    },
    teams: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/teams-2025-tour-down-under.csv",
    },
    riders: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/riders-2025-tour-down-under.csv",
    },
  },
];

describe.each(STARTLIST_TEST_CASES)(
  "Startlist [$year $race] parse HTML",
  (data) => {
    let html, expectedResults;

    beforeAll(async () => {
      html = await Bun.file(data.html).text();
      expectedResults = await Bun.file(data.startlist.json).json();
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeRaceStartListFromHtml() returns [] until JSDOM migration complete
    test("Should return an array of teams", async () => {
      const startLists = scrapeRaceStartListFromHtml(html);
      expect(startLists).toBeInstanceOf(Array);
      expect(startLists.length).toBeGreaterThan(0);
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeRaceStartListFromHtml() returns [] until JSDOM migration complete
    test("Should match expected results", async () => {
      const startLists = scrapeRaceStartListFromHtml(html);
      expect(startLists).toEqual(expectedResults);
    });
  },
);

describe.each(STARTLIST_TEST_CASES)(
  "Startlist [$year $race] save CSV",
  (data) => {
    let startlistData, originalDataDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      startlistData = await Bun.file(data.startlist.json).json();

      const teams = new Teams();
      await teams.update(startlistData);

      const riders = new Riders();
      await riders.update(startlistData);

      const raceRiders = new RaceRiders();
      await raceRiders.update(startlistData);
    });

    afterAll(async () => {
      process.env.DATA_DIR = originalDataDir;
      try {
        await Bun.file(`${TEST_DATA_DIR}/teams.csv`).delete();
        await Bun.file(`${TEST_DATA_DIR}/riders.csv`).delete();
        await Bun.file(`${TEST_DATA_DIR}/raceRiders.csv`).delete();
      } catch {}
    });

    test("Teams - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(`${TEST_DATA_DIR}/teams.csv`).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Year,Team Pcs Id,Team Name,Classification,Team Pcs Url,Jersey Image Pcs Url,Previous Team Pcs Id,Next Team Pcs Id",
      );
    });

    test("Teams - Should match expected CSV content", async () => {
      const actual = await Bun.file(`${TEST_DATA_DIR}/teams.csv`).text();
      const expected = await Bun.file(data.teams.csv).text();
      expect(actual).toBe(expected);
    });

    test("Riders - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(`${TEST_DATA_DIR}/riders.csv`).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe("Rider Pcs Id,Rider Name,Date Of Birth,Nationality");
    });

    test("Riders - Should match expected CSV content", async () => {
      const actual = await Bun.file(`${TEST_DATA_DIR}/riders.csv`).text();
      const expected = await Bun.file(data.riders.csv).text();
      expect(actual).toBe(expected);
    });

    test("RaceRiders - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceRiders.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe("Race UID,Bib,Rider Pcs Id,Team Pcs Id,Rider,Flag");
    });

    test("RaceRiders - Should match expected CSV content", async () => {
      const actual = await Bun.file(`${TEST_DATA_DIR}/raceRiders.csv`).text();
      const expected = await Bun.file(data.startlist.csv).text();
      expect(actual).toBe(expected);
    });
  },
);
