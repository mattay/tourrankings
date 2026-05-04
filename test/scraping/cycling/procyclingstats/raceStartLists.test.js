import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { extractStartlistFromHtml } from "@scrappers/source/proCyclingStats/raceStartList";
import { Teams } from "@models/teams";
import { Riders } from "@models/riders";
import { RaceRiders } from "@models/raceRiders";

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
    html: "test/scraping/cycling/procyclingstats/html/race-startlist-2025/raceStartList-2025-tour-down-under.html",
    startlist: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/raceStartList-2025-tour-down-under.csv",
    },
    teams: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/teams-2025-tour-down-under.csv",
    },
    riders: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceRiders/2025/riders-2025-tour-down-under.csv",
    },
    raceRiders: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStartlist/2025/raceStartList-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceRiders/2025/raceRiders-2025-tour-down-under.csv",
    },
  },
];

// Helper to flatten teams from nested structure
const flattenTeams = (startlistData) =>
  startlistData.map((team) => ({
    year: team.year,
    pcsId: team.pcsId,
    name: team.name,
    classification: team.classification,
    pcsUrl: team.pcsUrl,
    jerseyImagePcsUrl: team.jerseyImageUrl,
    previousPcsId: team.previousPcsId || "",
    nextPcsId: team.nextPcsId || "",
  }));

// Helper to flatten riders from nested structure
const flattenRiders = (startlistData) =>
  startlistData.flatMap(
    (team) =>
      team.riders?.map((rider) => ({
        pcsId: rider.pcsId,
        surname: rider.surname,
        firstNames: rider.firstNames,
        dateOfBirth: rider.dateOfBirth || "",
        nationality: rider.nationality || "",
      })) || [],
  );

// Helper to flatten raceRiders from nested structure
const flattenRaceRiders = (startlistData, raceUID) =>
  startlistData.flatMap(
    (team) =>
      team.riders?.map((rider) => ({
        raceUID: raceUID,
        bib: rider.bib,
        pcsId: rider.pcsId,
        teamPcsId: team.pcsId,
        rider: `${rider.surname} ${rider.firstNames}`,
        flag: rider.flag,
      })) || [],
  );

describe.each(STARTLIST_TEST_CASES)(
  "Startlist [$year $race] parse HTML",
  (data) => {
    let html, expectedResults, url;

    beforeAll(async () => {
      html = await Bun.file(data.html).text();
      expectedResults = await Bun.file(data.startlist.json).json();
      url = `https://www.procyclingstats.com/race/${slug(data.race)}/${data.year}/startlist`;
    });

    test("Should return an array of teams", async () => {
      const startLists = extractStartlistFromHtml(html, data.year, url);
      expect(startLists).toBeInstanceOf(Array);
      expect(startLists.length).toBeGreaterThan(0);
    });

    test("Should match expected results", async () => {
      const startLists = extractStartlistFromHtml(html, data.year, url);
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
        await teams.update(flattenTeams(startlistData));
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${namespacedTestDir}/teams.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Year,Pcs Id,Name,Classification,Pcs Url,Jersey Image Pcs Url,Previous Pcs Id,Next Pcs Id",
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
        // Write to ${namespacedTestDir}/riders.csv
        await riders.update(flattenRiders(startlistData));
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${namespacedTestDir}/riders.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Pcs Id,Surname,First Names,Date Of Birth,Nationality",
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
        // Generate raceUID from race name and year (e.g., "tour-down-under:2025")
        const raceUID = `${slug(data.race)}:${data.year}`;
        await raceRiders.update(flattenRaceRiders(startlistData, raceUID));
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${namespacedTestDir}/raceRiders.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Race UID,Bib,Pcs Id,Team Pcs Id,Rider,Flag",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${namespacedTestDir}/raceRiders.csv`,
        ).text();
        const expected = await Bun.file(data.raceRiders.csv).text();
        expect(actual).toBe(expected);
      });
    });
  },
);
