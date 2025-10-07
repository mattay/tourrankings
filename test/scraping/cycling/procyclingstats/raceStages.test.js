import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeRaceStagesFromHtml } from "src/scrappers/source/proCyclingStats/raceStages";

describe.each([
  {
    race: "Tour Down Under",
    input:
      "test/scraping/cycling/procyclingstats/html/races-2025/raceStages-2025-tour-down-under.html",
    output:
      "test/scraping/cycling/procyclingstats/fixtures/raceStages-2025-tour-down_under.json",
  },
])(`$race Stages`, (data) => {
  let html, expectedResults;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const output = Bun.file(data.output);

    html = await input.text();
    expectedResults = await output.json();
  });

  test("Should return an array of stages", async () => {
    const races = await scrapeRaceStagesFromHtml(html);
    expect(races).toBeInstanceOf(Array);
    expect(races.length).toBeGreaterThan(0);
  });

  test("Should match expected results", async () => {
    const races = await scrapeRaceStagesFromHtml(html);
    expect(races).toEqual(expectedResults);
  });
});
