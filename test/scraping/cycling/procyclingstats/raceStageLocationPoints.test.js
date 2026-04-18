import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { RaceStageLocationPoints } from "src/models/raceStages/raceStageLocationPoints";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for CSV output tests
const LOCATION_POINTS_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    locationPoints: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationPoints-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationPoints-2025-tour-down-under.csv",
    },
  },
];

describe.each(LOCATION_POINTS_TEST_CASES)(
  "Location Points [$year $race Stage $stage] save CSV",
  (data) => {
    let locationPointsData, originalDataDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      locationPointsData = await Bun.file(data.locationPoints.json).json();
      const locationPoints = new RaceStageLocationPoints();
      await locationPoints.update(locationPointsData);
    });

    afterAll(async () => {
      process.env.DATA_DIR = originalDataDir;
      try {
        await rm(TEST_DATA_DIR, { recursive: true, force: true });
      } catch (error) {
        console.error(
          `Failed to cleanup test directory ${TEST_DATA_DIR}:`,
          error,
        );
      }
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
  },
);
