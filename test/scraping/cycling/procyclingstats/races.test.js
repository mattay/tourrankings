import { expect, test, describe, beforeAll } from "bun:test";
import { scrapeRacesFromHtml } from "src/scrappers/source/proCyclingStats/races";

describe.each([
  {
    filterYear: 2025,
    filterClass: "2.UWT",
    input: "test/scraping/cycling/procyclingstats/html/races-2025-2.UWT.html",
    output:
      "test/scraping/cycling/procyclingstats/fixtures/races-2025-2.UWT.json",
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
    const races = await scrapeRacesFromHtml(html, data.filterYear);
    expect(races).toBeInstanceOf(Array);
    expect(races.length).toBeGreaterThan(0);
  });

  test("should match expected results", async () => {
    const races = await scrapeRacesFromHtml(html, data.filterYear);
    expect(races).toEqual(expectedResults);
  });
});
