import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { scrapeRaceStartListFromHtml } from "src/scrappers/source/proCyclingStats/raceStartList";
import { Teams } from "src/models/teams";
import { Riders } from "src/models/riders";
import { RaceRiders } from "src/models/raceRiders";

const BASE_TEST_DIR = process.env.TEST_DATA_DIR || "./temp/tests";

/**
 * Convert a string to a URL-friendly slug
 * @param {string} str - The string to slugify
 * @returns {string} The slugified string
 */
function slug(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

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
    let namespacedTestDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      // Create namespaced directory per test case to prevent data leakage
      namespacedTestDir = `${BASE_TEST_DIR}/${data.year}-${slug(data.race)}`;
      process.env.DATA_DIR = namespacedTestDir;
      startlistData = await Bun.file(data.startlist.json).json();
    });

    afterAll(async () => {
      // Restore original DATA_DIR state properly
      if (originalDataDir === undefined) {
        delete process.env.DATA_DIR;
      } else {
        process.env.DATA_DIR = originalDataDir;
      }
      // Clean up the entire namespaced test directory
      try {
        await rm(namespacedTestDir, { recursive: true, force: true });
      } catch (error) {
        console.error(
          `Failed to cleanup test directory ${namespacedTestDir}:`,
          error,
        );
      }
    });

    describe("Teams", () => {
      beforeAll(async () => {
        const teams = new Teams();
        await teams.update(startlistData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(`${namespacedTestDir}/teams.csv`).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Year,Team Pcs Id,Team Name,Classification,Team Pcs Url,Jersey Image Pcs Url,Previous Team Pcs Id,Next Team Pcs Id",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(`${namespacedTestDir}/teams.csv`).text();
        const expected = await Bun.file(data.teams.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Riders", () => {
      beforeAll(async () => {
        const riders = new Riders();
        await riders.update(startlistData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(`${namespacedTestDir}/riders.csv`).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Rider Pcs Id,Rider Name,Date Of Birth,Nationality",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(`${namespacedTestDir}/riders.csv`).text();
        const expected = await Bun.file(data.riders.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("RaceRiders", () => {
      beforeAll(async () => {
        const raceRiders = new RaceRiders();
        await raceRiders.update(startlistData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${namespacedTestDir}/raceRiders.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Race UID,Bib,Rider Pcs Id,Team Pcs Id,Rider,Flag",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(`${namespacedTestDir}/raceRiders.csv`).text();
        const expected = await Bun.file(data.startlist.csv).text();
        expect(actual).toBe(expected);
      });
    });
  },
);
