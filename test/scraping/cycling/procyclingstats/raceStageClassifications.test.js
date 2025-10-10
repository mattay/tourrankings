import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeFromHtmlRacesResults,
  scrapeFromHtmlRacesGeneralClassification,
  scrapeFromHtmlRacesMountainsClassification,
  scrapeFromHtmlRacesPointsClassification,
  scrapeFromHtmlRacesTeamsClassification,
  scrapeFromHtmlRacesYouthClassification } from "src/scrappers/source/proCyclingStats/raceStageResults";

describe.each([
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    input:
      "test/scraping/cycling/procyclingstats/html/raceStageResults-tour-down-under-1.html",
    output: {
      generalClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-general.json",
      mountainsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-mountain.json",
      pointsClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-points.json",
      teamClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-teams.json",
      youngClassification:
        "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1-classification-youth.",
    },
  },
])(`$race - $year - Stage $stage`, (data) => {
  let html,
    expectedGeneral,
    expectedMountains,
    expectedPoints,
    expectedTeams,
    expectedYouth;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const outputGeneral = Bun.file(data.output.generalClassification);
    const outputMountains = Bun.file(data.output.mountainsClassification);
    const outputPoints = Bun.file(data.output.pointsClassification);
    const outputTeams = Bun.file(data.output.teamClassification);
    const outputYouth = Bun.file(data.output.youngClassification);

    html = await input.text();
    expectedGeneral = await outputGeneral.json();
    expectedMountains = await outputMountains.json();
    expectedPoints = await outputPoints.json();
    expectedTeams = await outputTeams.json();
    expectedYouth = await outputYouth.json();
  });

  test("should match expected general classification", async () => {
    const raceGeneralClassification = await scrapeFromHtmlRacesGeneralClassification(html, data.filterYear);
    expect(raceGeneralClassification).toEqual(expectedGeneral);
  });

  test("should match expected mountains classification", async () => {
    const raceMountainsClassification = await scrapeFromHtmlRacesMountainsClassification(html, data.filterYear);
    expect(raceMountainsClassification).toEqual(expectedMountains);
  });

  test("should match expected points classification", async () => {
    const racePointsClassification = await scrapeFromHtmlRacesPointsClassification(html, data.filterYear);
    expect(racePointsClassification).toEqual(expectedPoints);
  });

  test("should match expected teams classification", async () => {
    const raceTeamsClassification = await scrapeFromHtmlRacesTeamsClassification(html, data.filterYear);
    expect(raceTeamsClassification).toEqual(expectedTeams);
  });

  test("should match expected youth classification", async () => {
    const raceYouthClassification = await scrapeFromHtmlRacesYouthClassification(html, data.filterYear);
    expect(raceYouthClassification).toEqual(expectedYouth);
  });
