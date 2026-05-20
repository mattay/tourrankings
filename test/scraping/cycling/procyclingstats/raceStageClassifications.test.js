import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { mkdir, rm } from "fs/promises";
import { extractStageClassificationResultsFromHTML } from "src/scrappers/source/proCyclingStats/raceStageResults";
import { RaceStageResults } from "@models/raceStages/raceStageResults";
import { ClassificationGeneral } from "@models/raceStageClassifications/classificationGeneral";
import { ClassificationMountains } from "@models/raceStageClassifications/classificationMountains";
import { ClassificationPoints } from "@models/raceStageClassifications/classificationPoints";
import { ClassificationTeam } from "@models/raceStageClassifications/classificationTeam";
import { ClassificationYouth } from "@models/raceStageClassifications/classificationYouth";
import { RaceStageLocationPointsResults } from "@models/raceStages/raceStageLocationPointsResults";
import { RaceStageLocationMountainsResults } from "@models/raceStages/raceStageLocationMountainsResults";

describe.each([
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    stageUID: "tour-down-under:2025:1",
    stageType: "",
    html: "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-tour-down-under-1.html",
    json: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-mountains.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-youth.json",
      teamsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-teams-contest.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-youth-contest.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-mountains-location-contest.json",
    },
    csv: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1.csv",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-general.csv",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-mountains.csv",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-points.csv",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-teams.csv",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-youth.csv",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-points-location-contest.csv",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-mountains-location-contest.csv",
    },
  },
  {
    race: "Tour Down Under",
    year: 2026,
    stage: 0,
    stageUID: "tour-down-under:2026:0",
    stageType: "prologue",
    html: "test/scraping/cycling/procyclingstats/html/race-stages-2026/raceStageResults-2026-tour-down-under-0.html",
    json: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-mountains.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-youth.json",
      teamsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-teams-contest.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-youth-contest.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-mountains-location-contest.json",
    },
    csv: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0.csv",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-general.csv",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-mountains.csv",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-points.csv",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-teams.csv",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-classification-youth.csv",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-points-location-contest.csv",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2026/tour-down-under-0/raceStageResults-2026-tour-down-under-0-mountains-location-contest.csv",
    },
  },
  {
    race: "Vuelta a España",
    year: 2025,
    stage: 11,
    stageUID: "vuelta-a-espana:2025:11",
    stageType: "",
    html: "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-vuelta-a-espana-11.html",
    json: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-mountains.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-youth.json",
      teamsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-teams-contest.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-youth-contest.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-mountains-location-contest.json",
    },
    csv: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11.csv",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-general.csv",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-mountains.csv",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-points.csv",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-teams.csv",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-youth.csv",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-points-location-contest.csv",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-mountains-location-contest.csv",
    },
  },
  {
    race: "Giro d'Italia",
    year: 2025,
    stage: 6,
    stageUID: "giro-d-italia:2025:6",
    stageType: "",
    html: "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-giro-d-italia-6.html",
    json: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-mountains.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-youth.json",
      teamsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-teams-contest.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-youth-contest.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-mountains-location-contest.json",
    },
    csv: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6.csv",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-general.csv",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-mountains.csv",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-points.csv",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-teams.csv",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-classification-youth.csv",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-points-location-contest.csv",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6/raceStageResults-2025-giro-d-italia-6-mountains-location-contest.csv",
    },
  },
])("$race $year Stage $stage", (data) => {
  const TEST_DATA_DIR = `/tmp/race-stage-classifications-test-${Date.now()}`;

  let stageClassificationResults,
    expectedResults,
    expectedGeneral,
    expectedMountains,
    expectedPoints,
    expectedTeams,
    expectedYouth,
    expectedTeamsContest,
    expectedYouthContest,
    expectedPointsLocations,
    expectedPointsLocationContest,
    expectedMountainsLocations,
    expectedMountainsLocationContest,
    expectedStageResultsCsv,
    expectedGeneralCsv,
    expectedMountainsCsv,
    expectedPointsCsv,
    expectedTeamsCsv,
    expectedYouthCsv,
    expectedPointsLocationContestCsv,
    expectedMountainsLocationContestCsv;

  beforeAll(async () => {
    process.env.DATA_DIR = TEST_DATA_DIR;
    const html = Bun.file(data.html);
    const jsonStage = Bun.file(data.json.stageResults);
    const jsonGeneral = Bun.file(data.json.generalClassification);
    const jsonMountains = Bun.file(data.json.mountainsClassification);
    const jsonPoints = Bun.file(data.json.pointsClassification);
    const jsonTeams = Bun.file(data.json.teamClassification);
    const jsonYouth = Bun.file(data.json.youngClassification);
    const jsonTeamsContest = Bun.file(data.json.teamsLocationContest);
    const jsonYouthContest = Bun.file(data.json.youthLocationContest);
    const jsonPointsLocations = Bun.file(data.json.pointsLocations);
    const jsonPointsLocationContest = Bun.file(data.json.pointsLocationContest);
    const jsonMountainsLocations = Bun.file(data.json.mountainsLocations);
    const jsonMountainsLocationContest = Bun.file(
      data.json.mountainsLocationContest,
    );

    const htmlCotnent = await html.text();
    const stageDetails = {
      year: data.year,
      stage: data.stage,
      stageUID: data.stageUID,
      stageType: data.stageType,
    };
    expectedResults = await jsonStage.json();
    expectedGeneral = await jsonGeneral.json();
    expectedMountains = await jsonMountains.json();
    expectedPoints = await jsonPoints.json();
    expectedTeams = await jsonTeams.json();
    expectedYouth = await jsonYouth.json();
    expectedTeamsContest = await jsonTeamsContest.json();
    expectedYouthContest = await jsonYouthContest.json();
    expectedPointsLocations = await jsonPointsLocations.json();
    expectedMountainsLocations = await jsonMountainsLocations.json();
    expectedPointsLocationContest = await jsonPointsLocationContest.json();
    expectedMountainsLocationContest =
      await jsonMountainsLocationContest.json();

    const jsonStageCsv = Bun.file(data.csv.stageResults);
    const jsonGeneralCsv = Bun.file(data.csv.generalClassification);
    const jsonMountainsCsv = Bun.file(data.csv.mountainsClassification);
    const jsonPointsCsv = Bun.file(data.csv.pointsClassification);
    const jsonTeamsCsv = Bun.file(data.csv.teamClassification);
    const jsonYouthCsv = Bun.file(data.csv.youngClassification);
    const jsonPointsLocationContestCsv = Bun.file(
      data.csv.pointsLocationContest,
    );
    const jsonMountainsLocationContestCsv = Bun.file(
      data.csv.mountainsLocationContest,
    );

    expectedStageResultsCsv = await jsonStageCsv.text();
    expectedGeneralCsv = await jsonGeneralCsv.text();
    expectedMountainsCsv = await jsonMountainsCsv.text();
    expectedPointsCsv = await jsonPointsCsv.text();
    expectedTeamsCsv = await jsonTeamsCsv.text();
    expectedYouthCsv = await jsonYouthCsv.text();
    expectedPointsLocationContestCsv =
      await jsonPointsLocationContestCsv.text();
    expectedMountainsLocationContestCsv =
      await jsonMountainsLocationContestCsv.text();

    stageClassificationResults = extractStageClassificationResultsFromHTML(
      htmlCotnent,
      stageDetails,
    );

    await mkdir(TEST_DATA_DIR, { recursive: true });

    const stageResultsModel = new RaceStageResults();
    stageResultsModel.rows = stageClassificationResults.stage;
    stageResultsModel.filePath = `${TEST_DATA_DIR}/raceStageResults.csv`;
    await stageResultsModel.write();

    const generalModel = new ClassificationGeneral();
    generalModel.rows = stageClassificationResults.gc;
    generalModel.filePath = `${TEST_DATA_DIR}/classificationGeneral.csv`;
    await generalModel.write();

    const mountainsModel = new ClassificationMountains();
    mountainsModel.rows = stageClassificationResults.mountains ?? [];
    mountainsModel.filePath = `${TEST_DATA_DIR}/classificationMountains.csv`;
    await mountainsModel.write();

    const pointsModel = new ClassificationPoints();
    pointsModel.rows = stageClassificationResults.points ?? [];
    pointsModel.filePath = `${TEST_DATA_DIR}/classificationPoints.csv`;
    await pointsModel.write();

    const teamsModel = new ClassificationTeam();
    teamsModel.rows = stageClassificationResults.teams;
    teamsModel.filePath = `${TEST_DATA_DIR}/classificationTeams.csv`;
    await teamsModel.write();

    const youthModel = new ClassificationYouth();
    youthModel.rows = stageClassificationResults.youth;
    youthModel.filePath = `${TEST_DATA_DIR}/classificationYouth.csv`;
    await youthModel.write();

    const pointsLocationContestModel = new RaceStageLocationPointsResults();
    pointsLocationContestModel.rows =
      stageClassificationResults.pointsLocationContest ?? [];
    pointsLocationContestModel.filePath = `${TEST_DATA_DIR}/pointsLocationContest.csv`;
    await pointsLocationContestModel.write();

    const mountainsLocationContestModel =
      new RaceStageLocationMountainsResults();
    mountainsLocationContestModel.rows =
      stageClassificationResults.mountainsLocationContest ?? [];
    mountainsLocationContestModel.filePath = `${TEST_DATA_DIR}/mountainsLocationContest.csv`;
    await mountainsLocationContestModel.write();
  });

  afterAll(async () => {
    await rm(TEST_DATA_DIR, { recursive: true, force: true });
  });

  test("Should match expected stage results", async () => {
    expect(stageClassificationResults.stage).toEqual(expectedResults);
  });

  test("Should match expected general classification", async () => {
    expect(stageClassificationResults.gc).toEqual(expectedGeneral);
  });

  test("Should match expected mountains classification", async () => {
    expect(stageClassificationResults.mountains ?? []).toEqual(
      expectedMountains,
    );
  });

  test("Should match expected points classification", async () => {
    expect(stageClassificationResults.points ?? []).toEqual(expectedPoints);
  });

  test("Should match expected teams classification", async () => {
    expect(stageClassificationResults.teams).toEqual(expectedTeams);
  });

  test("Should match expected youth classification", async () => {
    expect(stageClassificationResults.youth).toEqual(expectedYouth);
  });

  test("Should match expected teams contest", async () => {
    expect(stageClassificationResults.teamsContest).toEqual(
      expectedTeamsContest,
    );
  });

  test("Should match expected youth contest", async () => {
    expect(stageClassificationResults.youthContest).toEqual(
      expectedYouthContest,
    );
  });

  test("Should match expected points locations", async () => {
    expect(stageClassificationResults.pointsLocations ?? []).toEqual(
      expectedPointsLocations,
    );
  });

  test("Should match expected points location contest", async () => {
    expect(stageClassificationResults.pointsLocationContest ?? []).toEqual(
      expectedPointsLocationContest,
    );
  });

  test("Should match expected mountains locations", async () => {
    expect(stageClassificationResults.mountainsLocations ?? []).toEqual(
      expectedMountainsLocations,
    );
  });

  test("Should match expected mountains location contest", async () => {
    expect(stageClassificationResults.mountainsLocationContest ?? []).toEqual(
      expectedMountainsLocationContest,
    );
  });

  test("Should match expected stage results CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/raceStageResults.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedStageResultsCsv.trim());
  });

  test("Should match expected general classification CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/classificationGeneral.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedGeneralCsv.trim());
  });

  test("Should match expected mountains classification CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/classificationMountains.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedMountainsCsv.trim());
  });

  test("Should match expected points classification CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/classificationPoints.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedPointsCsv.trim());
  });

  test("Should match expected teams classification CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/classificationTeams.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedTeamsCsv.trim());
  });

  test("Should match expected youth classification CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/classificationYouth.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedYouthCsv.trim());
  });

  test("Should match expected points location contest CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/pointsLocationContest.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedPointsLocationContestCsv.trim());
  });

  test("Should match expected mountains location contest CSV content", async () => {
    const csvContent = await Bun.file(
      `${TEST_DATA_DIR}/mountainsLocationContest.csv`,
    ).text();
    expect(csvContent.trim()).toBe(expectedMountainsLocationContestCsv.trim());
  });
});
