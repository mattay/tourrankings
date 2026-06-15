#!/usr/bin/env bun
/**
 * ndjson-to-parquet.js - Converts local NDJSON log files to Parquet format
 * for analysis in ObservableHQ via DuckDB.
 *
 * Usage: bun run scripts/ndjson-to-parquet.js [logs-dir]
 * Default logs-dir: ./logs
 *
 * Output: access.parquet, api.parquet, health.parquet, static.parquet
 *
 * Requires: @duckdb/node-api
 *   bun add @duckdb/node-api
 */

import { DuckDBInstance } from "@duckdb/node-api";
import fs from "fs";
import path from "path";

const LOGS_DIR = process.argv[2] || "./temp/production/logs";
const LOG_FILES = ["access.log", "api.log", "health.log", "static.log"];

/**
 * Converts a single NDJSON file to Parquet using DuckDB.
 *
 * @param {import("@duckdb/node-api").DuckDBConnection} connection - Active DuckDB connection
 * @param {string} ndjsonFile - Absolute or relative path to the source NDJSON file
 * @param {string} parquetFile - Absolute or relative path for the output Parquet file
 * @returns {Promise<void>}
 */
async function convertToParquet(connection, ndjsonFile, parquetFile) {
  if (!fs.existsSync(ndjsonFile)) {
    console.log(`Skipping ${path.basename(ndjsonFile)} — file not found`);
    return;
  }

  const query = `COPY (SELECT * FROM read_ndjson_auto('${ndjsonFile}')) TO '${parquetFile}' (FORMAT PARQUET)`;
  await connection.run(query);

  const size = fs.statSync(parquetFile).size;
  console.log(
    `Converted ${path.basename(ndjsonFile)} → ${path.basename(parquetFile)} (${(size / 1024).toFixed(1)} KB)`,
  );
}

async function main() {
  if (!fs.existsSync(LOGS_DIR)) {
    console.error(`Logs directory not found: ${LOGS_DIR}`);
    console.error("Run ./scripts/pull-logs.sh first to download logs.");
    process.exit(1);
  }

  console.log(`Converting NDJSON files from ${LOGS_DIR}/ to Parquet...\n`);

  const instance = await DuckDBInstance.create(":memory:");
  const connection = await instance.connect();

  for (const logFile of LOG_FILES) {
    const ndjsonPath = path.join(LOGS_DIR, logFile);
    const parquetName = logFile.replace(".log", ".parquet");
    const parquetPath = path.join(LOGS_DIR, parquetName);

    await convertToParquet(connection, ndjsonPath, parquetPath);
  }

  console.log(
    "\nDone. Upload the .parquet files to ObservableHQ for analysis.",
  );
}

main().catch((err) => {
  console.error("Conversion failed:", err);
  process.exit(1);
});
