import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeFromHtmlRacesResults } from "src/scrappers/source/proCyclingStats/raceStageResults";

describe.each([
  {
    race: "Tour Down Under",
    year: 2025,
    stage: 1,
    input:
      "test/scraping/cycling/procyclingstats/html/raceStageResults-tour-down-under-1.html",
    output:
      "test/scraping/cycling/procyclingstats/fixtures/raceStageResults-2025-tour-down-under-1.json",
  },
])(`$race - $year - Stage $stage`, (data) => {
  let html, expectedResults;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const output = Bun.file(data.output);

    html = await input.text();
    expectedResults = await output.json();
  });

  test("should match expected stage results", async () => {
    const raceStageResults = await scrapeFromHtmlRacesResults(
      html,
      data.filterYear,
    );
    expect(raceStageResults).toEqual(expectedResults);
  });
});
