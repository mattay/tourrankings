import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { extractRacesFromHtml } from "src/scrappers/source/proCyclingStats/races";
import { Races } from "src/models/races";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for both HTML parsing and CSV output tests
const TEST_CASES_SEASON_RACES = [
  {
    filterYear: 2025,
    filterClass: "2.UWT",
    html: "test/scraping/cycling/procyclingstats/html/races-2025-2.UWT.html",
    races: {
      json: "test/scraping/cycling/procyclingstats/fixtures/races-2025-2.UWT.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/races-2025-2.UWT.csv",
    },
  },
];

describe.each(TEST_CASES_SEASON_RACES)(
  "Season races [$filterYear $filterClass] parse HTML",
  (data) => {
    let html, expectedResults, races;

    beforeAll(async () => {
      html = await Bun.file(data.html).text();
      expectedResults = await Bun.file(data.races.json).json();
      races = extractRacesFromHtml(html, data.filterYear);
    });

    test("Should return an array of world tour races", () => {
      expect(races).toBeInstanceOf(Array);
      expect(races.length).toBeGreaterThan(0);
    });

    test("Should match expected JSON", () => {
      expect(races).toEqual(expectedResults);
    });
  },
);

describe.each(TEST_CASES_SEASON_RACES)(
  "Season races [$filterYear $filterClass] save CSV",
  (data) => {
    let racesData, originalDataDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      racesData = await Bun.file(data.races.json).json();
      const races = new Races();
      await races.update(racesData);
    });

    afterAll(async () => {
      process.env.DATA_DIR = originalDataDir;
      try {
        await rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch (error) {
        console.error(
          `Failed to cleanup test directory ${TEST_DATA_DIR}:",
          error,
        );
      }
    });

    test("Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(`${TEST_DATA_DIR}/races.csv`).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Race UID,Year,Start Date,End Date,Race Class,Race Name,Race Pcs ID,Race Pcs Url",
      );
    });

    test("Should match expected CSV content", async () => {
      const actual = await Bun.file(`${TEST_DATA_DIR}/races.csv`).text();
      const expected = await Bun.file(data.races.csv).text();
      expect(actual).toBe(expected);
    });
  },
);
