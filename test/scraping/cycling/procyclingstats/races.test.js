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
])(`$year - $race Stages`, (data) => {
  let html, expectedResults, races;

  beforeAll(async () => {
    const input = Bun.file(data.input);
    const output = Bun.file(data.output);

    html = await input.text();
    expectedResults = await output.json();
    races = scrapeRacesFromHtml(html, data.filterYear);
  });

  test("Should return an array of world tour races", () => {
    expect(races).toBeInstanceOf(Array);
    expect(races.length).toBeGreaterThan(0);
  });

  test("Should match expected results", () => {
    expect(races).toEqual(expectedResults);
  });
});
