import { expect, test, describe, beforeAll, afterAll } from "bun:test";
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

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for both HTML parsing and CSV output tests
const CLASSIFICATIONS_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    html: "test/scraping/cycling/procyclingstats/html/raceStageResults-2025-tour-down-under-1.html",
    generalClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-general.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-general-2025-tour-down-under-1.csv",
    },
    mountainsClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-mountain.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-mountain-2025-tour-down-under-1.csv",
    },
    pointsClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-points.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-points-2025-tour-down-under-1.csv",
    },
    teamClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-teams.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-teams-2025-tour-down-under-1.csv",
    },
    youngClassification: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-youth.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-classification-youth-2025-tour-down-under-1.csv",
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

    // TODO(de-puppetter-races): Fixture files missing - classification JSON files need to be created from expected output
    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      const generalData = await Bun.file(
        data.generalClassification.json,
      ).json();
      const generalClassification = new ClassificationGeneral();
      await generalClassification.update(generalData);

      const mountainsData = await Bun.file(
        data.mountainsClassification.json,
      ).json();
      const mountainsClassification = new ClassificationMountain();
      await mountainsClassification.update(mountainsData);

      const pointsData = await Bun.file(data.pointsClassification.json).json();
      const pointsClassification = new ClassificationPoints();
      await pointsClassification.update(pointsData);

      const teamsData = await Bun.file(data.teamClassification.json).json();
      const teamsClassification = new ClassificationTeam();
      await teamsClassification.update(teamsData);

      const youthData = await Bun.file(data.youngClassification.json).json();
      const youthClassification = new ClassificationYouth();
      await youthClassification.update(youthData);
    });

    afterAll(async () => {
      process.env.DATA_DIR = originalDataDir;
      try {
        await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationGeneral.csv`,
        ).delete();
        await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationMountain.csv`,
        ).delete();
        await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationPoints.csv`,
        ).delete();
        await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationTeams.csv`,
        ).delete();
        await Bun.file(
          `${TEST_DATA_DIR}/raceStageClassificationYouth.csv`,
        ).delete();
      } catch {}
    });

    test("General Classification - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationGeneral.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,UCI,Bonis,Time,Delta",
      );
    });

    test("General Classification - Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationGeneral.csv`,
      ).text();
      const expected = await Bun.file(data.generalClassification.csv).text();
      expect(actual).toBe(expected);
    });

    test("Points Classification - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationPoints.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,Points,Today,Bonis,Time,Delta",
      );
    });

    test("Points Classification - Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationPoints.csv`,
      ).text();
      const expected = await Bun.file(data.pointsClassification.csv).text();
      expect(actual).toBe(expected);
    });

    test("Mountain Classification - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationMountain.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team,Points,Today",
      );
    });

    test("Mountain Classification - Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationMountain.csv`,
      ).text();
      const expected = await Bun.file(data.mountainsClassification.csv).text();
      expect(actual).toBe(expected);
    });

    test("Teams Classification - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationTeams.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Team,Class,Time,Delta",
      );
    });

    test("Teams Classification - Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationTeams.csv`,
      ).text();
      const expected = await Bun.file(data.teamClassification.csv).text();
      expect(actual).toBe(expected);
    });

    test("Youth Classification - Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationYouth.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,Previous Stage Ranking,Change,Bib,Specialty,Rider,Age,Team",
      );
    });

    test("Youth Classification - Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageClassificationYouth.csv`,
      ).text();
      const expected = await Bun.file(data.youngClassification.csv).text();
      expect(actual).toBe(expected);
    });
  },
);
