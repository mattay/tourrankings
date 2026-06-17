import fs from "fs/promises";
import path from "path";
import config from "@server/config";
import { logError } from "@utils/logging";

/**
 * @typedef {"healthy" | "unhealthy" | "error"} LastScrapeCheckStatus
 */

/**
 * @typedef {Object} LastScrapeCheckResult
 * @property {LastScrapeCheckStatus} status
 * @property {string|null} lastRunAt - ISO timestamp of the last scrape, or null
 */

const DEFAULT_THRESHOLD_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Checks whether the scraper cron has run recently by reading its heartbeat file.
 *
 * @returns {Promise<LastScrapeCheckResult>}
 *   - `"healthy"`   — heartbeat exists and is within the threshold
 *   - `"unhealthy"` — heartbeat exists but is older than the threshold
 *   - `"error"`     — heartbeat is missing or unreadable
 */
export async function statusOfLastScrape() {
  const dataDir = process.env.DATA_DIR || config.dataService.dataDir;
  const heartbeatPath = path.join(dataDir, "..", "last-scrape.txt");

  try {
    const content = await fs.readFile(heartbeatPath, "utf8");
    const firstLine = content.split("\n")[0];
    const timestamp = firstLine.split(" ")[0];
    const lastRunAt = new Date(timestamp);

    if (isNaN(lastRunAt.getTime())) {
      return { status: "error", lastRunAt: null };
    }

    const ageMs = Date.now() - lastRunAt.getTime();
    const thresholdMs =
      parseInt(process.env.SCRAPER_HEARTBEAT_THRESHOLD_MS, 10) ||
      DEFAULT_THRESHOLD_MS;
    const status = ageMs <= thresholdMs ? "healthy" : "unhealthy";

    return { status, lastRunAt: lastRunAt.toISOString() };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { status: "error", lastRunAt: null };
    }
    logError("Health", "Last scrape check failed", error);
    return { status: "error", lastRunAt: null };
  }
}
