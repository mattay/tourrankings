import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { extractStagesFromHtml } from "src/scrappers/source/proCyclingStats/raceStages";
import { RaceStages } from "src/models/raceStages";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

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
const STAGES_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    html: "test/scraping/cycling/procyclingstats/html/races-2025/raceStages-2025-tour-down-under.html",
    stages: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStages/2025/raceStages-2025-tour-down-under.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStages/2025/raceStages-2025-tour-down-under.csv",
    },
  },
];

describe.each(STAGES_TEST_CASES)("Stages [$year $race] parse HTML", (data) => {
  let html, expectedResults;

  beforeAll(async () => {
    html = await Bun.file(data.html).text();
    expectedResults = await Bun.file(data.stages.json).json();
  });

  test("Should return an array of stages", async () => {
    const stages = await extractStagesFromHtml(html, data.year, slug(data.race));
    expect(stages).toBeInstanceOf(Array);
    expect(stages.length).toBeGreaterThan(0);
  });

  test("Should match expected results", async () => {
    const stages = await extractStagesFromHtml(html, data.year, slug(data.race));
    expect(stages).toEqual(expectedResults);
  });
});

describe.each(STAGES_TEST_CASES)("Stages [$year $race] save CSV", (data) => {
  let stagesData, originalDataDir;

  beforeAll(async () => {
    originalDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = TEST_DATA_DIR;

    stagesData = await Bun.file(data.stages.json).json();
    const raceStages = new RaceStages();
    await raceStages.update(stagesData);
  });

  afterAll(async () => {
    // Restore original DATA_DIR state properly
    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
    try {
      await Bun.file(`${TEST_DATA_DIR}/raceStages.csv`).delete();
    } catch (error) {
      console.error(`Failed to delete ${TEST_DATA_DIR}/raceStages.csv:`, error);
    }
  });

  test("Should write correct CSV headers", async () => {
    const csvContent = await Bun.file(`${TEST_DATA_DIR}/raceStages.csv`).text();
    const headers = csvContent.split("\n")[0];
    expect(headers).toBe(
      "Race UID,Stage UID,Year,Date,Stage,Stage Type,Parcours Type,Departure,Arrival,Distance,Vertical Meters,Stage Pcs Url",
    );
  });

  test("Should match expected CSV content", async () => {
    const actual = await Bun.file(`${TEST_DATA_DIR}/raceStages.csv`).text();
    const expected = await Bun.file(data.stages.csv).text();
    expect(actual).toBe(expected);
  });
});
