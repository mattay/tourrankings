#!/usr/bin/env bun
/**
Usage:
  results.js --name=<name> --url=<url> [--filter=<filter>]
  results.js --name=<name> --html=<path> [--filter=<filter>]
  results.js (-h | --help)

Generate stage results fixtures from ProCyclingStats HTML.

Options:
  --name=<name>        Base name for all output files [required]
  --url=<url>          URL to fetch HTML from
  --html=<path>        Path to local HTML file
  --filter=<json>      JSON filter config [default: {"bibs":[],"ranks":[],"sample":10}]
  -h --help            Show this screen

Examples:
  results.js --name=tdu-2025-stage-1 --url=https://www.procyclingstats.com/race/tour-down-under/2025/stage-1
  results.js --name=tdu-stage-1-top3 --html=fixtures/html/raw.html --filter='{"ranks":[1,2,3]}'
*/

import { parseArgs } from "util";
import { cleanHtml } from "./utils/html-cleaner.js";
import { applyFilter } from "./utils/filter-apply.js";
import { writeFixtures, copyCsvToFixtures } from "./utils/fixture-writer.js";
import { scrapeFromHtmlRacesResults } from "../../../src/scrappers/source/proCyclingStats/raceStageResults.js";
import { RaceStageResults } from "../../../src/models/raceStages/raceStageResults.js";

const { values, positionals } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: 'string' },
    url: { type: 'string' },
    html: { type: 'string' },
    filter: { type: 'string', default: '{"bibs":[],"ranks":[],"sample":10}' },
    help: { type: 'boolean', short: 'h' },
  },
  allowPositionals: true,
});

// Show help
if (values.help || positionals.includes('-h') || positionals.includes('--help')) {
  console.log(`
Usage:
  results.js --name=<name> --url=<url> [--filter=<filter>]
  results.js --name=<name> --html=<path> [--filter=<filter>]
  results.js (-h | --help)

Generate stage results fixtures from ProCyclingStats HTML.

Options:
  --name=<name>        Base name for all output files [required]
  --url=<url>          URL to fetch HTML from
  --html=<path>        Path to local HTML file  
  --filter=<json>      JSON filter config [default: {"bibs":[],"ranks":[],"sample":10}]
  -h --help            Show this screen
`);
  process.exit(0);
}

// Validate required args
if (!values.name) {
  console.error("Error: --name is required");
  process.exit(1);
}

if (!values.url && !values.html) {
  console.error("Error: Either --url or --html is required");
  process.exit(1);
}

async function main() {
  console.log(`\n🚀 Generating results fixtures: ${values.name}`);
  
  // 1. Get HTML
  let rawHtml;
  if (values.url) {
    console.log(`📥 Fetching HTML from ${values.url}...`);
    const response = await fetch(values.url);
    if (!response.ok) {
      console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
      process.exit(1);
    }
    rawHtml = await response.text();
  } else {
    console.log(`📂 Reading HTML from ${values.html}...`);
    rawHtml = await Bun.file(values.html).text();
  }
  
  // 2. Clean HTML
  console.log("🧹 Cleaning HTML...");
  const cleanHtmlContent = cleanHtml(rawHtml);
  
  // 3. Parse with scraper (currently returns [], but structure ready for de-puppetter-races)
  console.log("🔍 Parsing stage results...");
  // Note: scrapeFromHtmlRacesResults currently returns [] (stub)
  // When de-puppetter-races is ready, this will extract real data
  const allResults = scrapeFromHtmlRacesResults(cleanHtmlContent, 2025);
  
  if (allResults.length === 0) {
    console.warn("⚠️  Parser returned empty array (expected - stub implementation)");
    console.warn("   This will work when de-puppetter-races implements the parser");
  }
  
  // 4. Apply filter
  const filter = JSON.parse(values.filter);
  console.log(`🔧 Applying filter: ${JSON.stringify(filter)}`);
  const filteredResults = applyFilter(allResults, filter);
  console.log(`   Filtered to ${filteredResults.length} records`);
  
  // 5. Write HTML and JSON fixtures
  await writeFixtures(values.name, {
    html: cleanHtmlContent,
    json: filteredResults,
  });
  
  // 6. Generate CSV via model
  if (filteredResults.length > 0) {
    console.log("📝 Generating CSV via RaceStageResults model...");
    const model = new RaceStageResults();
    await model.update(filteredResults);
    await model.write();
    await copyCsvToFixtures(values.name, model.filePath);
  } else {
    console.log("⚠️  Skipping CSV generation (no data)");
  }
  
  console.log(`\n✅ Done! Fixtures written to fixtures/${values.name}/\n`);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
