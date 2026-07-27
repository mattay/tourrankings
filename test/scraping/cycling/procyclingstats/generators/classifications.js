#!/usr/bin/env bun
/**
Generate all 5 classifications fixtures from ProCyclingStats.

Usage:
  classifications.js --name=<name> --url=<url> [--filter=<filter>]
  classifications.js (-h | --help)
*/

import { parseArgs } from "util";
import { cleanHtml } from "./utils/html-cleaner.js";
import { applyFilter } from "./utils/filter-apply.js";
import { writeFixtures } from "./utils/fixture-writer.js";
import {
  scrapeFromHtmlRacesClassificationGeneral,
  scrapeFromHtmlRacesClassificationMountains,
  scrapeFromHtmlRacesClassificationPoints,
  scrapeFromHtmlRacesClassificationTeams,
  scrapeFromHtmlRacesClassificationYouth,
} from "../../../src/scrappers/source/proCyclingStats/raceStageResults.js";
import { ClassificationGeneral } from "../../../src/models/raceStageClassifications/classificationGeneral.js";
import { ClassificationMountain } from "../../../src/models/raceStageClassifications/classificationMountain.js";
import { ClassificationPoints } from "../../../src/models/raceStageClassifications/classificationPoints.js";
import { ClassificationTeam } from "../../../src/models/raceStageClassifications/classificationTeam.js";
import { ClassificationYouth } from "../../../src/models/raceStageClassifications/classificationYouth.js";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    name: { type: 'string' },
    url: { type: 'string' },
    filter: { type: 'string', default: '{"bibs":[],"ranks":[],"sample":10}' },
    help: { type: 'boolean', short: 'h' },
  },
});

if (values.help) {
  console.log(`Usage: classifications.js --name=<name> --url=<url> [--filter=<filter>]`);
  process.exit(0);
}

if (!values.name || !values.url) {
  console.error("Error: --name and --url are required");
  process.exit(1);
}

async function generateClassification(name, scraperFn, ModelClass, label, filter) {
  console.log(`\n  📊 ${label}...`);
  
  const response = await fetch(values.url);
  const rawHtml = await response.text();
  const cleanHtmlContent = cleanHtml(rawHtml);
  
  const allData = scraperFn(cleanHtmlContent, 2025);
  const filteredData = applyFilter(allData, filter);
  
  const fixtureName = `${name}-${label.toLowerCase().replace(/\s+/g, '-')}`;
  await writeFixtures(fixtureName, {
    html: cleanHtmlContent,
    json: filteredData,
  });
  
  if (filteredData.length > 0) {
    const model = new ModelClass();
    await model.update(filteredData);
    await model.write();
    // Copy CSV would need fixtureName path
  }
  
  console.log(`     ✓ ${filteredData.length} records`);
}

async function main() {
  console.log(`\n🚀 Generating classifications fixtures: ${values.name}`);
  
  const filter = JSON.parse(values.filter);
  
  // Generate all 5 classifications
  await generateClassification(
    values.name,
    scrapeFromHtmlRacesClassificationGeneral,
    ClassificationGeneral,
    "General",
    filter
  );
  
  await generateClassification(
    values.name,
    scrapeFromHtmlRacesClassificationMountains,
    ClassificationMountain,
    "Mountain",
    filter
  );
  
  await generateClassification(
    values.name,
    scrapeFromHtmlRacesClassificationPoints,
    ClassificationPoints,
    "Points",
    filter
  );
  
  await generateClassification(
    values.name,
    scrapeFromHtmlRacesClassificationTeams,
    ClassificationTeam,
    "Teams",
    filter
  );
  
  await generateClassification(
    values.name,
    scrapeFromHtmlRacesClassificationYouth,
    ClassificationYouth,
    "Youth",
    filter
  );
  
  console.log(`\n✅ Done!\n`);
}

main().catch(console.error);
