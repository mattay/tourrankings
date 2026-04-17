import { expect, test, describe, beforeAll } from "bun:test";
import {
  scrapeFromHtmlRacesResults,
  scrapeFromHtmlRacesClassificationGeneral,
  scrapeFromHtmlRacesClassificationMountains,
  scrapeFromHtmlRacesClassificationPoints,
  scrapeFromHtmlRacesClassificationTeams,
  scrapeFromHtmlRacesClassificationYouth,
  extractStageClassificationResultsFromHTML,
} from "src/scrappers/source/proCyclingStats/raceStageResults";

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
    },
  },
])(`$year - $race Stages`, (data) => {
  let stageClassificationResults,
    expectedResults,
    expectedGeneral,
    expectedMountains,
    expectedPoints,
    expectedTeams,
    expectedYouth;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const outputStage = Bun.file(data.output.stageResults);
    const outputGeneral = Bun.file(data.output.generalClassification);
    const outputMountains = Bun.file(data.output.mountainsClassification);
    const outputPoints = Bun.file(data.output.pointsClassification);
    const outputTeams = Bun.file(data.output.teamClassification);
    const outputYouth = Bun.file(data.output.youngClassification);

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

    stageClassificationResults = extractStageClassificationResultsFromHTML(
      html,
      stageDetails,
    );
  });

  test("Should match expected stage results", async () => {
    expect(stageClassificationResults.stage).toEqual(expectedResults);
  });

  test("Should match expected general classification", async () => {
    // const raceGeneralClassification =
    //   await scrapeFromHtmlRacesClassificationGeneral(html, data.year);
    expect(stageClassificationResults.gc).toEqual(expectedGeneral);
  });

  test("Should match expected mountains classification", async () => {
    // const raceMountainsClassification =
    // await scrapeFromHtmlRacesClassificationMountains(html, data.year);
    expect(stageClassificationResults.kom).toEqual(expectedMountains);
  });

  test("Should match expected points classification", async () => {
    // const racePointsClassification =
    //   await scrapeFromHtmlRacesClassificationPoints(html, data.year);
    expect(stageClassificationResults.points).toEqual(expectedPoints);
  });

  test("Should match expected teams classification", async () => {
    // const raceTeamsClassification =
    // await scrapeFromHtmlRacesClassificationTeams(html, data.year);
    expect(stageClassificationResults.teams).toEqual(expectedTeams);
  });

  test("Should match expected youth classification", async () => {
    // const raceYouthClassification =
    // await scrapeFromHtmlRacesClassificationYouth(html, data.year);
    expect(stageClassificationResults.youth).toEqual(expectedYouth);
  });
});
