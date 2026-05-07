#!/usr/bin/env bun
/**
 * Generate CSV fixtures from existing JSON fixtures for race stage classification tests.
 * Uses the same models as the tests to ensure CSV output matches expected format.
 */

import { ClassificationGeneral } from "@models/raceStageClassifications/classificationGeneral";
import { ClassificationMountains } from "@models/raceStageClassifications/classificationMountains";
import { ClassificationPoints } from "@models/raceStageClassifications/classificationPoints";
import { ClassificationTeam } from "@models/raceStageClassifications/classificationTeam";
import { ClassificationYouth } from "@models/raceStageClassifications/classificationYouth";
import { RaceStageResults } from "@models/raceStages/raceStageResults";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join, dirname } from "path";

// Test cases with their JSON and CSV fixture paths
const TEST_CASES = [
  {
    race: "tour-down-under",
    year: 2025,
    stage: 1,
    jsonDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1",
    csvDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/tour-down-under-1",
    types: [
      { json: "raceStageResults-2025-tour-down-under-1.json", csv: "raceStageResults-2025-tour-down-under-1.csv", Model: RaceStageResults, key: "stage" },
      { json: "raceStageResults-2025-tour-down-under-1-classification-general.json", csv: "raceStageResults-2025-tour-down-under-1-classification-general.csv", Model: ClassificationGeneral, key: "gc" },
      { json: "raceStageResults-2025-tour-down-under-1-classification-mountains.json", csv: "raceStageResults-2025-tour-down-under-1-classification-mountains.csv", Model: ClassificationMountains, key: "mountains" },
      { json: "raceStageResults-2025-tour-down-under-1-classification-points.json", csv: "raceStageResults-2025-tour-down-under-1-classification-points.csv", Model: ClassificationPoints, key: "points" },
      { json: "raceStageResults-2025-tour-down-under-1-classification-teams.json", csv: "raceStageResults-2025-tour-down-under-1-classification-teams.csv", Model: ClassificationTeam, key: "teams" },
      { json: "raceStageResults-2025-tour-down-under-1-classification-youth.json", csv: "raceStageResults-2025-tour-down-under-1-classification-youth.csv", Model: ClassificationYouth, key: "youth" },
    ]
  },
  {
    race: "vuelta-a-espana",
    year: 2025,
    stage: 11,
    jsonDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11",
    csvDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/vuelta-a-espana-11",
    types: [
      { json: "raceStageResults-2025-vuelta-a-espana-11.json", csv: "raceStageResults-2025-vuelta-a-espana-11.csv", Model: RaceStageResults, key: "stage" },
      { json: "raceStageResults-2025-vuelta-a-espana-11-classification-general.json", csv: "raceStageResults-2025-vuelta-a-espana-11-classification-general.csv", Model: ClassificationGeneral, key: "gc" },
      { json: "raceStageResults-2025-vuelta-a-espana-11-classification-mountains.json", csv: "raceStageResults-2025-vuelta-a-espana-11-classification-mountains.csv", Model: ClassificationMountains, key: "mountains" },
      { json: "raceStageResults-2025-vuelta-a-espana-11-classification-points.json", csv: "raceStageResults-2025-vuelta-a-espana-11-classification-points.csv", Model: ClassificationPoints, key: "points" },
      { json: "raceStageResults-2025-vuelta-a-espana-11-classification-teams.json", csv: "raceStageResults-2025-vuelta-a-espana-11-classification-teams.csv", Model: ClassificationTeam, key: "teams" },
      { json: "raceStageResults-2025-vuelta-a-espana-11-classification-youth.json", csv: "raceStageResults-2025-vuelta-a-espana-11-classification-youth.csv", Model: ClassificationYouth, key: "youth" },
    ]
  },
  {
    race: "giro-d-italia",
    year: 2025,
    stage: 6,
    jsonDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6",
    csvDir: "test/scraping/cycling/procyclingstats/fixtures/raceStageResults/2025/giro-d-italia-6",
    types: [
      { json: "raceStageResults-2025-giro-d-italia-6.json", csv: "raceStageResults-2025-giro-d-italia-6.csv", Model: RaceStageResults, key: "stage" },
      { json: "raceStageResults-2025-giro-d-italia-6-classification-general.json", csv: "raceStageResults-2025-giro-d-italia-6-classification-general.csv", Model: ClassificationGeneral, key: "gc" },
      { json: "raceStageResults-2025-giro-d-italia-6-classification-mountains.json", csv: "raceStageResults-2025-giro-d-italia-6-classification-mountains.csv", Model: ClassificationMountains, key: "mountains" },
      { json: "raceStageResults-2025-giro-d-italia-6-classification-points.json", csv: "raceStageResults-2025-giro-d-italia-6-classification-points.csv", Model: ClassificationPoints, key: "points" },
      { json: "raceStageResults-2025-giro-d-italia-6-classification-teams.json", csv: "raceStageResults-2025-giro-d-italia-6-classification-teams.csv", Model: ClassificationTeam, key: "teams" },
      { json: "raceStageResults-2025-giro-d-italia-6-classification-youth.json", csv: "raceStageResults-2025-giro-d-italia-6-classification-youth.csv", Model: ClassificationYouth, key: "youth" },
    ]
  },
];

async function generateFixtures() {
  for (const testCase of TEST_CASES) {
    for (const type of testCase.types) {
      const jsonPath = join(testCase.jsonDir, type.json);
      const csvPath = join(testCase.csvDir, type.csv);
      
      // Create directory if it doesn't exist
      await mkdir(dirname(csvPath), { recursive: true });
      
      // Load JSON data
      const jsonData = await Bun.file(jsonPath).json();
      
      // Get the data array (stage results or classification data)
      const data = Array.isArray(jsonData) ? jsonData : jsonData[type.key];
      
      // Create model instance
      const model = new type.Model();
      
      // Override the file path to point to our desired CSV fixture path
      model.filePath = csvPath;
      
      // Set the data rows
      model.rows = data;
      
      // Write CSV to the fixture path
      await model.write();
      
      console.log(`Generated: ${csvPath}`);
    }
  }
}

generateFixtures().catch(console.error);
