import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { randomUUID } from "crypto";
import { join } from "path";
import {
  scrapeFromHtmlRacesClassificationGeneral,
  scrapeFromHtmlRacesClassificationMountains,
  scrapeFromHtmlRacesClassificationPoints,
  scrapeFromHtmlRacesClassificationTeams,
  scrapeFromHtmlRacesClassificationYouth,
} from "src/scrappers/source/proCyclingStats/raceStageResults";
import { ClassificationGeneral } from "src/models/raceStageClassifications/classificationGeneral";
import { ClassificationMountain } from "src/models/raceStageClassifications/classificationMountain";
import { ClassificationPoints } from "src/models/raceStageClassifications/classificationPoints";
import { ClassificationTeam } from "src/models/raceStageClassifications/classificationTeam";
import { ClassificationYouth } from "src/models/raceStageClassifications/classificationYouth";
import { RaceStageLocationPoints } from "src/models/raceStages/raceStageLocationPoints";
import { RaceStageLocationMountains } from "src/models/raceStages/raceStageLocationMountains";

// Generate unique temp directory for this test suite to avoid conflicts
const BASE_TEST_DIR = process.env.TEST_DATA_DIR || "./temp/tests";
const TEST_DATA_DIR = join(BASE_TEST_DIR, `raceStageClassifications-${randomUUID()}`);

// Shared test data for both HTML parsing and CSV output tests
const CLASSIFICATIONS_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    html: "test/scraping/cycling/procyclingstats/html/raceStageResults-2025-tour-down-under-1.html",
    generalClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-general-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-general-2025-tour-down-under-1.csv",
    },
    mountainsClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-mountain-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-mountain-2025-tour-down-under-1.csv",
    },
    pointsClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-points-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-points-2025-tour-down-under-1.csv",
    },
    teamClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-teams-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-teams-2025-tour-down-under-1.csv",
    },
    youngClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-youth-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-youth-2025-tour-down-under-1.csv",
    },
    locationPoints: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationPoints-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationPoints-2025-tour-down-under.csv",
    },
    locationMountains: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationMountains-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationMountains-2025-tour-down-under.csv",
    },
  },
];

describe.each(CLASSIFICATIONS_TEST_CASES)(
  "Stage classifications [$year $race $stage] parse HTML ",
  (data) => {
    let html,
      expectedGeneral,
      expectedMountains,
      expectedPoints,
      expectedTeams,
      expectedYouth;

    // TODO(de-puppetter-races): Fixture files missing - general, mountains, points, teams, youth classification JSON files need to be created from expected output
    beforeAll(async () => {
      html = await Bun.file(data.html).text();
      expectedGeneral = await Bun.file(data.generalClassification.json).json();
      expectedMountains = await Bun.file(
        data.mountainsClassification.json,
      ).json();
      expectedPoints = await Bun.file(data.pointsClassification.json).json();
      expectedTeams = await Bun.file(data.teamClassification.json).json();
      expectedYouth = await Bun.file(data.youngClassification.json).json();
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesClassificationGeneral() returns [] until JSDOM migration complete
    test("Should match expected general classification", async () => {
      const raceGeneralClassification =
        await scrapeFromHtmlRacesClassificationGeneral(html, data.year);
      expect(raceGeneralClassification).toEqual(expectedGeneral);
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesClassificationMountains() returns [] until JSDOM migration complete
    test("Should match expected mountains classification", async () => {
      const raceMountainsClassification =
        await scrapeFromHtmlRacesClassificationMountains(html, data.year);
      expect(raceMountainsClassification).toEqual(expectedMountains);
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesClassificationPoints() returns [] until JSDOM migration complete
    test("Should match expected points classification", async () => {
      const racePointsClassification =
        await scrapeFromHtmlRacesClassificationPoints(html, data.year);
      expect(racePointsClassification).toEqual(expectedPoints);
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesClassificationTeams() returns [] until JSDOM migration complete
    test("Should match expected teams classification", async () => {
      const raceTeamsClassification =
        await scrapeFromHtmlRacesClassificationTeams(html, data.year);
      expect(raceTeamsClassification).toEqual(expectedTeams);
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesClassificationYouth() returns [] until JSDOM migration complete
    test("Should match expected youth classification", async () => {
      const raceYouthClassification =
        await scrapeFromHtmlRacesClassificationYouth(html, data.year);
      expect(raceYouthClassification).toEqual(expectedYouth);
    });
  },
);

describe.each(CLASSIFICATIONS_TEST_CASES)(
  "Stage classifications [$year $race $stage] save CSV",
  (data) => {
    let originalDataDir;

    beforeAll(() => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;
    });

    afterAll(async () => {
      // Restore original DATA_DIR state properly
      if (originalDataDir === undefined) {
        delete process.env.DATA_DIR;
      } else {
        process.env.DATA_DIR = originalDataDir;
      }
      try {
        await rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch (error) {
        console.error(
          `Failed to cleanup test directory ${TEST_DATA_DIR}:`,
          error,
        );
      }
    });

    describe("General Classification", () => {
      beforeAll(async () => {
        const generalData = await Bun.file(
          data.generalClassification.json,
        ).json();
        const generalClassification = new ClassificationGeneral();
        await generalClassification.update(generalData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationGeneral.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,UCI,Bonis,Time,Delta",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationGeneral.csv`,
        ).text();
        const expected = await Bun.file(data.generalClassification.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Points Classification", () => {
      beforeAll(async () => {
        const pointsData = await Bun.file(data.pointsClassification.json).json();
        const pointsClassification = new ClassificationPoints();
        await pointsClassification.update(pointsData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationPoints.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,Points,Today,Bonis,Time,Delta",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationPoints.csv`,
        ).text();
        const expected = await Bun.file(data.pointsClassification.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Mountain Classification", () => {
      beforeAll(async () => {
        const mountainsData = await Bun.file(
          data.mountainsClassification.json,
        ).json();
        const mountainsClassification = new ClassificationMountain();
        await mountainsClassification.update(mountainsData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationMountain.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,Points,Today",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationMountain.csv`,
        ).text();
        const expected = await Bun.file(data.mountainsClassification.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Teams Classification", () => {
      beforeAll(async () => {
        const teamsData = await Bun.file(data.teamClassification.json).json();
        const teamsClassification = new ClassificationTeam();
        await teamsClassification.update(teamsData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationTeams.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Team,Class,Time,Delta",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationTeams.csv`,
        ).text();
        const expected = await Bun.file(data.teamClassification.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Youth Classification", () => {
      beforeAll(async () => {
        const youthData = await Bun.file(data.youngClassification.json).json();
        const youthClassification = new ClassificationYouth();
        await youthClassification.update(youthData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationYouth.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationYouth.csv`,
        ).text();
        const expected = await Bun.file(data.youngClassification.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Location Points", () => {
      beforeAll(async () => {
        const locationPointsData = await Bun.file(data.locationPoints.json).json();
        const locationPoints = new RaceStageLocationPoints();
        await locationPoints.update(locationPointsData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStageLocationPoints.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Location ID,Stage UID,Year,Stage,Type,Location Name,Distance",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStageLocationPoints.csv`,
        ).text();
        const expected = await Bun.file(data.locationPoints.csv).text();
        expect(actual).toBe(expected);
      });
    });

    describe("Location Mountains", () => {
      beforeAll(async () => {
        const locationMountainsData = await Bun.file(
          data.locationMountains.json,
        ).json();
        const locationMountains = new RaceStageLocationMountains();
        await locationMountains.update(locationMountainsData);
      });

      test("Should write correct CSV headers", async () => {
        const csvContent = await Bun.file(
          `${TEST_DATA_DIR}/raceStagesLocationMountains.csv`,
        ).text();
        const headers = csvContent.split("\n")[0];
        expect(headers).toBe(
          "Location Id,Stage UID,Year,Stage,Type,Location Name,Distance",
        );
      });

      test("Should match expected CSV content", async () => {
        const actual = await Bun.file(
          `${TEST_DATA_DIR}/raceStagesLocationMountains.csv`,
        ).text();
        const expected = await Bun.file(data.locationMountains.csv).text();
        expect(actual).toBe(expected);
      });
    });
  },
);
