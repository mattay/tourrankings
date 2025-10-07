import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeRaceStartListFromHtml } from "src/scrappers/source/proCyclingStats/raceStartList";

describe.each([
  {
    race: "Tour Down Under",
    input:
      "test/scraping/cycling/procyclingstats/html/raceStartlist-2025-tour-down-under.html",
    output:
      "test/scraping/cycling/procyclingstats/fixtures/raceStartlist-2025-tour-down-under.json",
  },
])(`$filterYear $filterClass races`, (data) => {
  let html, expectedResults;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const output = Bun.file(data.output);

    html = await input.text();
    expectedResults = await output.json();
  });

  test("should return an array of world tour races", async () => {
    const startLists = await scrapeRaceStartListFromHtml(html);
    expect(startLists).toBeInstanceOf(Array);
    expect(startLists.length).toBeGreaterThan(0);
  });

  test("should match expected results", async () => {
    const startLists = await scrapeRaceStartListFromHtml(html);
    expect(startLists).toEqual(expectedResults);
  });
});
