import { expect, test, describe, beforeAll } from "bun:test";
import { extractStageClassificationResultsFromHTML } from "src/scrappers/source/proCyclingStats/raceStageResults";

describe.each([
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    stageUID: "tour-down-under:2025:1",
    stageType: "",
    input:
      "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-tour-down-under-1.html",
    output: {
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
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-teams-stage-day.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-classification-youth-stage-day.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1/raceStageResults-2025-tour-down-under-1-mountains-location-contest.json",
    },
  },
  {
    race: "Vuelta a España",
    year: 2025,
    stage: 11,
    stageUID: "vuelta-a-espana:2025:11",
    stageType: "",
    input:
      "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-vuelta-a-espana-11.html",
    output: {
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
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-teams-stage-day.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-classification-youth-stage-day.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11/raceStageResults-2025-vuelta-a-espana-11-mountains-location-contest.json",
    },
  },
  {
    race: "Vuelta a España",
    year: 2025,
    stage: 21,
    stageUID: "vuelta-a-espana:2025:21",
    stageType: "",
    input:
      "test/scraping/cycling/procyclingstats/html/race-stages-2025/raceStageResults-2025-vuelta-a-espana-21.html",
    output: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-mountains.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-youth.json",
      teamsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-teams-stage-day.json",
      youthLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-classification-youth-stage-day.json",
      pointsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-points-locations.json",
      pointsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-points-location-contest.json",
      mountainsLocations:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-mountains-locations.json",
      mountainsLocationContest:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-21/raceStageResults-2025-vuelta-a-espana-21-mountains-location-contest.json",
    },
  },
],`$year - $race Stages $stage`, (data) => {
  let stageClassificationResults,
    expectedResults,
    expectedGeneral,
    expectedMountains,
    expectedPoints,
    expectedTeams,
    expectedYouth,
    expectedTeamsLocationContest,
    expectedYouthLocationContest,
    expectedPointsLocations,
    expectedPointsLocationContest,
    expectedMountainsLocations,
    expectedMountainsLocationContest;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const outputStage = Bun.file(data.output.stageResults);
    const outputGeneral = Bun.file(data.output.generalClassification);
    const outputMountains = Bun.file(data.output.mountainsClassification);
    const outputPoints = Bun.file(data.output.pointsClassification);
    const outputTeams = Bun.file(data.output.teamClassification);
    const outputYouth = Bun.file(data.output.youngClassification);
    const outputTeamsLocationContest = Bun.file(data.output.teamsLocationContest);
    const outputYouthLocationContest = Bun.file(data.output.youthLocationContest);
    const outputPointsLocations = Bun.file(data.output.pointsLocations);
    const outputPointsLocationContest = Bun.file(
      data.output.pointsLocationContest,
    );
    const outputMountainsLocations = Bun.file(data.output.mountainsLocations);
    const outputMountainsLocationContest = Bun.file(
      data.output.mountainsLocationContest,
    );

    const html = await input.text();
    const stageDetails = {
      year: data.year,
      stage: data.stage,
      stageUID: data.stageUID,
      stageType: data.stageType,
    };
    expectedResults = await outputStage.json();
    expectedGeneral = await outputGeneral.json();
    expectedMountains = await outputMountains.json();
    expectedPoints = await outputPoints.json();
    expectedTeams = await outputTeams.json();
    expectedYouth = await outputYouth.json();
    expectedTeamsLocationContest = await outputTeamsLocationContest.json();
    expectedYouthLocationContest = await outputYouthLocationContest.json();
    expectedPointsLocations = await outputPointsLocations.json();
    expectedMountainsLocations = await outputMountainsLocations.json();
    expectedPointsLocationContest = await outputPointsLocationContest.json();
    expectedMountainsLocationContest =
      await outputMountainsLocationContest.json();

    stageClassificationResults = extractStageClassificationResultsFromHTML(
      html,
      stageDetails,
    );
  });

  test("Should match expected stage results", async () => {
    expect(stageClassificationResults.stage).toEqual(expectedResults);
  });

  test("Should match expected general classification", async () => {
    expect(stageClassificationResults.gc).toEqual(expectedGeneral);
  });

  test("Should match expected mountains classification", async () => {
    expect(stageClassificationResults.mountains).toEqual(expectedMountains);
  });

  test("Should match expected points classification", async () => {
    expect(stageClassificationResults.points).toEqual(expectedPoints);
  });

  test("Should match expected teams classification", async () => {
    expect(stageClassificationResults.teams).toEqual(expectedTeams);
  });

  test("Should match expected youth classification", async () => {
    expect(stageClassificationResults.youth).toEqual(expectedYouth);
  });

  test("Should match expected teams location contest", async () => {
    expect(stageClassificationResults.teamsLocationContest).toEqual(
      expectedTeamsLocationContest,
    );
  });

  test("Should match expected youth location contest", async () => {
    expect(stageClassificationResults.youthLocationContest).toEqual(
      expectedYouthLocationContest,
    );
  });

  test("Should match expected points locations", async () => {
    expect(stageClassificationResults.pointsLocations).toEqual(
      expectedPointsLocations,
    );
  });

  test("Should match expected points location contest", async () => {
    expect(stageClassificationResults.pointsLocationContest).toEqual(
      expectedPointsLocationContest,
    );
  });

  test("Should match expected mountains locations", async () => {
    expect(stageClassificationResults.mountainsLocations).toEqual(
      expectedMountainsLocations,
    );
  });

  test("Should match expected mountains location contest", async () => {
    expect(stageClassificationResults.mountainsLocationContest).toEqual(
      expectedMountainsLocationContest,
    );
  });
});
