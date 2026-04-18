import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { scrapeFromHtmlRacesResults } from "src/scrappers/source/proCyclingStats/raceStageResults";
import { RaceStageResults } from "src/models/raceStages/raceStageResults";
import { RaceStages } from "src/models/raceStages";

const TEST_DATA_DIR = process.env.TEST_DATA_DIR || "./temp/tests/";

// Shared test data for both HTML parsing and CSV output tests
const STAGE_RESULTS_TEST_CASES = [
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    stageUID: "tour-down-under:2025:1",
    html: "test/scraping/cycling/procyclingstats/html/raceStageResults-2025-tour-down-under-1.html",
    stageResults: {
      json: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1.json",
      csv: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1.csv",
    },
  },
];

describe.each(STAGE_RESULTS_TEST_CASES)(
  "HTML parse stage results [$year $race $stage]",
  (data) => {
    let html, expectedResults;

    beforeAll(async () => {
      html = await Bun.file(data.html).text();
      expectedResults = await Bun.file(data.stageResults.json).json();
    });

    // TODO(de-puppetter-races): Unimplemented - scrapeFromHtmlRacesResults() returns [] until JSDOM migration complete
    test("Should match expected stage results", async () => {
      const raceStageResults = await scrapeFromHtmlRacesResults(
        html,
        data.year,
      );
      expect(raceStageResults).toEqual(expectedResults);
    });
  },
);

describe.each(STAGE_RESULTS_TEST_CASES)(
  "CSV save stage results [$year $race $stage]",
  (data) => {
    let stageResultsData, originalDataDir;

    beforeAll(async () => {
      originalDataDir = process.env.DATA_DIR;
      process.env.DATA_DIR = TEST_DATA_DIR;

      stageResultsData = await Bun.file(data.stageResults.json).json();
      const results = new RaceStageResults();
      await results.update(stageResultsData);
    });

    afterAll(async () => {
      process.env.DATA_DIR = originalDataDir;
      try {
        const dir = await Bun.open(TEST_DATA_DIR);
        for (const file of await dir.values()) {
          await file.delete();
        }
        await dir.delete();
      } catch {}
    });

    test("Should write correct CSV headers", async () => {
      const csvContent = await Bun.file(
        `${TEST_DATA_DIR}/raceStageResults.csv`,
      ).text();
      const headers = csvContent.split("\n")[0];
      expect(headers).toBe(
        "Stage UID,Stage,Rank,GC,Timelag,Bib,Specialty,Rider,Age,Team,UCI,Points,Bonis,Time,Delta",
      );
    });

    test("Should match expected CSV content", async () => {
      const actual = await Bun.file(
        `${TEST_DATA_DIR}/raceStageResults.csv`,
      ).text();
      const expected = await Bun.file(data.stageResults.csv).text();
      expect(actual).toBe(expected);
    });
  },
);
