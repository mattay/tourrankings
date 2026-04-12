import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeRaceStartListFromHtml } from "src/scrappers/source/proCyclingStats/raceStartList";

describe.each([
  {
    race: "Tour Down Under",
    year: 2025,
    input:
      "test/scraping/cycling/procyclingstats/html/raceStartlist-2025-tour-down-under.html",
    output:
      "test/scraping/cycling/procyclingstats/fixtures/raceStartlist-2025-tour-down-under.json",
  },
])(`$race $year`, (data) => {
  let html, expectedResults, startLists;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const output = Bun.file(data.output);

    html = await input.text();
    expectedResults = await output.json();
    startLists = scrapeRaceStartListFromHtml(html);
  });

  test("Should return an array of teams", async () => {
    expect(startLists).toBeInstanceOf(Array);
    expect(startLists.length).toBeGreaterThan(0);
  });

  test("Should match expected results", async () => {
    expect(startLists).toEqual(expectedResults);
  });
});
