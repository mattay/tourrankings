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
      "test/scraping/cycling/procyclingstats/html/raceStageResults-2025-tour-down-under-1.html",
    output: {
      stageResults:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1.json",
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-mountain.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-youth.json",
      teamStageDay:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-teams-stage-day.json",
      youngStageDay:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-youth-stage-day.json",
      pointsStageDay:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-points-stage-day.json",
      komStageDay:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-kom-stage-day.json",
    },
  },
])(`$year - $race Stages`, (data) => {
  let stageClassificationResults,
    expectedResults,
    expectedGeneral,
    expectedMountains,
    expectedPoints,
    expectedTeams,
    expectedYouth,
    expectedTeamsStageDay,
    expectedYouthStageDay,
    expectedPointsStageDay,
    expectedKomStageDay;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const outputStage = Bun.file(data.output.stageResults);
    const outputGeneral = Bun.file(data.output.generalClassification);
    const outputMountains = Bun.file(data.output.mountainsClassification);
    const outputPoints = Bun.file(data.output.pointsClassification);
    const outputTeams = Bun.file(data.output.teamClassification);
    const outputYouth = Bun.file(data.output.youngClassification);
    const outputTeamsStageDay = Bun.file(data.output.teamStageDay);
    const outputYouthStageDay = Bun.file(data.output.youngStageDay);
    const outputPointsStageDay = Bun.file(data.output.pointsStageDay);
    const outputKomStageDay = Bun.file(data.output.komStageDay);

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
    expectedTeamsStageDay = await outputTeamsStageDay.json();
    expectedYouthStageDay = await outputYouthStageDay.json();
    expectedPointsStageDay = await outputPointsStageDay.json();
    expectedKomStageDay = await outputKomStageDay.json();

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
    expect(stageClassificationResults.kom).toEqual(expectedMountains);
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

  test("Should match expected teams stage day (today) classification", async () => {
    expect(stageClassificationResults.teamsStageDay).toEqual(expectedTeamsStageDay);
  });

  test("Should match expected youth stage day (today) classification", async () => {
    expect(stageClassificationResults.youthStageDay).toEqual(expectedYouthStageDay);
  });

  test("Should match expected points stage day (today) classification", async () => {
    expect(stageClassificationResults.pointsStageDay).toEqual(expectedPointsStageDay);
  });

  test("Should match expected KOM stage day (today) classification", async () => {
    expect(stageClassificationResults.komStageDay).toEqual(expectedKomStageDay);
  });
});
