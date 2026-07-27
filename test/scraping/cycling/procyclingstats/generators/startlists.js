#!/usr/bin/env bun
/**
Generate startlist fixtures (Teams, Riders, RaceRiders) from ProCyclingStats.

Usage:
  startlists.js --name=<name> --url=<url> [--filter=<filter>]
  startlists.js (-h | --help)
*/

import { parseArgs } from "util";
import { cleanHtml } from "./utils/html-cleaner.js";
import { applyFilter } from "./utils/filter-apply.js";
import { writeFixtures, copyCsvToFixtures } from "./utils/fixture-writer.js";
import { scrapeRaceStartListFromHtml } from "../../../src/scrappers/source/proCyclingStats/raceStartList.js";
import { Teams } from "../../../src/models/teams/teams.js";
import { Riders } from "../../../src/models/riders/riders.js";
import { RaceRiders } from "../../../src/models/raceRiders/raceRiders.js";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: 'string' },
    url: { type: 'string' },
    filter: { type: 'string', default: '{"teams":[],"sample":5}' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: startlists.js --name=<name> --url=<url> [--filter=<filter>]`);
  process.exit(0);
}

if (!values.name || !values.url) {
  console.error("Error: --name and --url are required");
  process.exit(1);
}

async function main() {
  console.log(`\n🚀 Generating startlist fixtures: ${values.name}`);
  
  const response = await fetch(values.url);
  const rawHtml = await response.text();
  const cleanHtmlContent = cleanHtml(rawHtml);
  
  // Parse startlist (returns combined data)
  const allStartlist = scrapeRaceStartListFromHtml(cleanHtmlContent);
  const filter = JSON.parse(values.filter);
  
  // Filter can apply to teams
  const filteredStartlist = applyFilter(allStartlist, filter);
  
  // Write common fixture
  await writeFixtures(values.name, {
    html: cleanHtmlContent,
    json: filteredStartlist,
  });
  
  // Generate 3 CSVs: Teams, Riders, RaceRiders
  console.log("📝 Generating Teams CSV...");
  const teamsModel = new Teams();
  await teamsModel.update(filteredStartlist);
  await teamsModel.write();
  await copyCsvToFixtures(`${values.name}-teams`, teamsModel.filePath);
  
  console.log("📝 Generating Riders CSV...");
  const ridersModel = new Riders();
  await ridersModel.update(filteredStartlist);
  await ridersModel.write();
  await copyCsvToFixtures(`${values.name}-riders`, ridersModel.filePath);
  
  console.log("📝 Generating RaceRiders CSV...");
  const raceRidersModel = new RaceRiders();
  await raceRidersModel.update(filteredStartlist);
  await raceRidersModel.write();
  await copyCsvToFixtures(`${values.name}-raceriders`, raceRidersModel.filePath);
  
  console.log(`\n✅ Done!\n`);
}

main().catch(console.error);
