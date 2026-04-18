import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { rm } from "fs/promises";
import { RaceStageLocationMountains } from "src/models/raceStages/raceStageLocationMountains";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for CSV output tests
const LOCATION_MOUNTAINS_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    locationMountains: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationMountains-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageLocationMountains-2025-tour-down-under.csv",
    },
  },
];

describe.each(LOCATION_MOUNTAINS_TEST_CASES)(
  "Location Mountains [$year $race Stage $stage] save CSV",
  (data) => {
    let locationMountainsData, originalDataDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      locationMountainsData = await Bun.file(
        data.locationMountains.json,
      ).json();
      const locationMountains = new RaceStageLocationMountains();
      await locationMountains.update(locationMountainsData);
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
  },
);
