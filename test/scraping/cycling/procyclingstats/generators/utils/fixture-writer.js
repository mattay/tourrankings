/**
 * Fixture Writing Utilities
 * Writes HTML, JSON, and CSV fixtures
 */

import { join } from "path";

const FIXTURES_DIR = "test/scraping/cycling/procyclingstats/fixtures";

/**
 * Write all fixture files for a test case
 * @param {string} name - Base name for fixtures
 * @param {Object} data - Object with html, json properties
 * @returns {Promise<void>}
 */
export async function writeFixtures(name, data) {
  const dir = `${FIXTURES_DIR}/${name}`;
  
  // Create directory if needed
  try {
    await Bun.write(`${dir}/.gitkeep`, "");
  } catch {}
  
  // Write cleaned HTML
  if (data.html) {
    await Bun.write(`${dir}/${name}.html`, data.html);
    console.log(`✅ Wrote ${dir}/${name}.html`);
  }
  
  // Write JSON data
  if (data.json) {
    await Bun.write(
      `${dir}/${name}.json`, 
      JSON.stringify(data.json, null, 2)
    );
    console.log(`✅ Wrote ${dir}/${name}.json (${data.json.length} records)`);
  }
}

/**
 * Copy generated CSV from temp to fixtures
 * @param {string} name - Fixture name
 * @param {string} tempCsvPath - Path to temp CSV from model
 */
export async function copyCsvToFixtures(name, tempCsvPath) {
  const dir = `${FIXTURES_DIR}/${name}`;
  const csvContent = await Bun.file(tempCsvPath).text();
  await Bun.write(`${dir}/${name}.csv`, csvContent);
  console.log(`✅ Wrote ${dir}/${name}.csv`);
}
