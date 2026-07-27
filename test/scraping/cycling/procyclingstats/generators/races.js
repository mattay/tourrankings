#!/usr/bin/env bun
/**
Generate races fixtures from ProCyclingStats.

Usage:
  races.js --name=<name> --url=<url> [--filter=<filter>]
  races.js (-h | --help)

Options:
  --name=<name>        Base name for output files [required]
  --url=<url>          URL to fetch calendar HTML
  --filter=<json>      JSON filter config [default: {}]
  -h --help            Show this screen
*/

import { parseArgs } from "util";
import { cleanHtml } from "./utils/html-cleaner.js";
import { applyFilter } from "./utils/filter-apply.js";
import { writeFixtures, copyCsvToFixtures } from "./utils/fixture-writer.js";
import { scrapeRacesFromHtml } from "../../../src/scrappers/source/proCyclingStats/races.js";
import { Races } from "../../../src/models/races/races.js";

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
  console.log(`Usage: races.js --name=<name> --url=<url> [--filter=<filter>]`);
  process.exit(0);
}

if (!values.name || !values.url) {
  console.error("Error: --name and --url are required");
  process.exit(1);
}

async function main() {
  console.log(`\n🚀 Generating races fixtures: ${values.name}`);
  
  const response = await fetch(values.url);
  const rawHtml = await response.text();
  const cleanHtmlContent = cleanHtml(rawHtml);
  
  const allRaces = scrapeRacesFromHtml(cleanHtmlContent, 2025);
  const filter = JSON.parse(values.filter);
  const filteredRaces = applyFilter(allRaces, filter);
  
  await writeFixtures(values.name, {
    html: cleanHtmlContent,
    json: filteredRaces,
  });
  
  if (filteredRaces.length > 0) {
    const model = new Races();
    await model.update(filteredRaces);
    await model.write();
    await copyCsvToFixtures(values.name, model.filePath);
  }
  
  console.log(`\n✅ Done!\n`);
}

main().catch(console.error);
