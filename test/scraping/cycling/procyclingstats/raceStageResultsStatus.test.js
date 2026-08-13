import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { mkdir, rm, writeFile } from "fs/promises";
import { extractStageClassificationResultsFromHTML } from "src/scrappers/source/proCyclingStats/raceStageResults";
import { RaceStageResults } from "@models/raceStages/raceStageResults";
import { ClassificationGeneral } from "@models/raceStageClassifications/classificationGeneral";
import { ClassificationMountains } from "@models/raceStageClassifications/classificationMountains";
import { ClassificationPoints } from "@models/raceStageClassifications/classificationPoints";
import { ClassificationTeam } from "@models/raceStageClassifications/classificationTeam";
import { ClassificationYouth } from "@models/raceStageClassifications/classificationYouth";
import { RaceStageLocationPointsResults } from "@models/raceStages/raceStageLocationPointsResults";
import { RaceStageLocationMountainsResults } from "@models/raceStages/raceStageLocationMountainsResults";

/**
 * @typedef {Object} StatusModelTestCase
 * @property {string} name - Human readable name for the classification.
 * @property {Function} modelFactory - Function that returns a new CSV model instance.
 * @property {Object} sampleRow - A minimal row containing the required index fields.
 */

/** @type {StatusModelTestCase[]} */
const statusModels = [
  {
    name: "stage results",
    modelFactory: () => new RaceStageResults(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      bib: 999,
      status: "DNF",
    },
  },
  {
    name: "general classification",
    modelFactory: () => new ClassificationGeneral(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      bib: 999,
      status: "DNS",
    },
  },
  {
    name: "points classification",
    modelFactory: () => new ClassificationPoints(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      bib: 999,
      status: "OTL",
    },
  },
  {
    name: "mountains classification",
    modelFactory: () => new ClassificationMountains(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      bib: 999,
      status: "DF",
    },
  },
  {
    name: "youth classification",
    modelFactory: () => new ClassificationYouth(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      bib: 999,
      status: "NR",
    },
  },
  {
    name: "teams classification",
    modelFactory: () => new ClassificationTeam(),
    sampleRow: {
      stageUID: "tour-down-under:2025:1",
      stage: 1,
      rank: null,
      team: "Test Team",
      status: "DNF",
    },
  },
  {
    name: "points location contest",
    modelFactory: () => new RaceStageLocationPointsResults(),
    sampleRow: {
      locationUID: "tour-down-under:2025:1:points:1",
      rank: null,
      bib: 999,
      status: "DNS",
    },
  },
  {
    name: "mountains location contest",
    modelFactory: () => new RaceStageLocationMountainsResults(),
    sampleRow: {
      locationUID: "tour-down-under:2025:1:mountains:1",
      rank: null,
      bib: 999,
      status: "OTL",
    },
  },
];

describe("Race stage results status persistence", () => {
  const TEST_DATA_DIR = `/tmp/race-stage-status-test-${Date.now()}`;
  const HTML_PATH =
    "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-tour-down-under-1.html";
  const STAGE_DETAILS = {
    year: 2025,
    stage: 1,
    stageUID: "tour-down-under:2025:1",
    stageType: "",
  };

  /** @type {import("src/scrappers/source/proCyclingStats/raceStageResults").StageResults} */
  let stageClassificationResults;

  beforeAll(async () => {
    process.env.DATA_DIR = TEST_DATA_DIR;
    const htmlContent = await Bun.file(HTML_PATH).text();
    stageClassificationResults = extractStageClassificationResultsFromHTML(
      htmlContent,
      STAGE_DETAILS,
    );
    await mkdir(TEST_DATA_DIR, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  test("scraper exposes status on stage results rows", () => {
    const rows = stageClassificationResults.stage ?? [];
    const statuses = rows
      .map((row) => row.status)
      .filter((status) => status !== undefined && status !== "");

    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses).toContain("DNS");
  });

  test.each(statusModels)(
    "$name CSV model writes and reads the Status column",
    async ({ name, modelFactory, sampleRow }) => {
      const model = modelFactory();
      const fileName = model.filePath.split("/").pop();
      model.filePath = `${TEST_DATA_DIR}/${fileName}`;
      model.rows = [sampleRow];

      await model.write();
      await model.read();

      expect(model.rows).toHaveLength(1);
      expect(model.rows[0].status).toBe(sampleRow.status);
    },
  );

  test.each(statusModels)(
    "$name CSV file contains a Status header",
    async ({ name, modelFactory, sampleRow }) => {
      const model = modelFactory();
      const fileName = model.filePath.split("/").pop();
      model.filePath = `${TEST_DATA_DIR}/${fileName}`;
      model.rows = [sampleRow];

      await model.write();

      const csvContent = await Bun.file(model.filePath).text();
      const headerRow = csvContent.split("\n")[0];

      expect(headerRow).toContain("Status");
    },
  );

  test("RaceStageResults loads legacy CSV files that lack a Status column", async () => {
    const model = new RaceStageResults();
    const legacyPath = `${TEST_DATA_DIR}/legacyRaceStageResults.csv`;
    model.filePath = legacyPath;

    await writeFile(
      legacyPath,
      "Stage UID,Stage,Rank,GC,Timelag,Bib,UCI,Points,Bonis,Time\n" +
        "tour-down-under:2025:1,1,1,,,55,,,,,04:01:30\n",
      "utf8",
    );

    await model.read();

    expect(model.rows).toHaveLength(1);
    expect(model.rows[0].status).toBeUndefined();
  });
});
