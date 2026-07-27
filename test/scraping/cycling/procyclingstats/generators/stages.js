#!/usr/bin/env bun
/**
Generate stages fixtures from ProCyclingStats.

Usage:
  stages.js --name=<name> --url=<url> [--filter=<filter>]
  stages.js (-h | --help)
*/

import { parseArgs } from "util";
import { cleanHtml } from "./utils/html-cleaner.js";
import { applyFilter } from "./utils/filter-apply.js";
import { writeFixtures, copyCsvToFixtures } from "./utils/fixture-writer.js";
import { scrapeRaceStagesFromHtml } from "../../../src/scrappers/source/proCyclingStats/raceStages.js";
import { RaceStages } from "../../../src/models/raceStages/raceStages.js";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: 'string' },
    url: { type: 'string' },
    filter: { type: 'string', default: '{}' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: stages.js --name=<name> --url=<url> [--filter=<filter>]`);
  process.exit(0);
}

if (!values.name || !values.url) {
  console.error("Error: --name and --url are required");
  process.exit(1);
}

async function main() {
  console.log(`\n🚀 Generating stages fixtures: ${values.name}`);
  
  const response = await fetch(values.url);
  const rawHtml = await response.text();
  const cleanHtmlContent = cleanHtml(rawHtml);
  
  const allStages = scrapeRaceStagesFromHtml(cleanHtmlContent);
  const filter = JSON.parse(values.filter);
  const filteredStages = applyFilter(allStages, filter);
  
  await writeFixtures(values.name, {
    html: cleanHtmlContent,
    json: filteredStages,
  });
  
  if (filteredStages.length > 0) {
    const model = new RaceStages();
    await model.update(filteredStages);
    await model.write();
    await copyCsvToFixtures(values.name, model.filePath);
  }
  
  console.log(`\n✅ Done!\n`);
}

main().catch(console.error);
