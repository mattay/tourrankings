/**
 * Health check controller for monitoring application status
 */

import { logError } from "@utils/logging";
import { getAppVersion } from "@utils/version";
import {
  statusOfDataService,
  statusOfMemory,
  statusOfFilesystem,
  statusOfLastScrape,
} from "@server/controllers/health";

/**
 * @typedef {"healthy" | "degraded" | "unhealthy"} OverallHealthStatus
 */

/**
 * @typedef {Object} HealthCheckResponse
 * @property {OverallHealthStatus} status        - Aggregate status across all subsystems
 * @property {string}              timestamp     - ISO 8601 timestamp of when the check ran
 * @property {number}              uptime        - Process uptime in seconds
 * @property {string}              environment   - Active `NODE_ENV`, defaults to `"development"`
 * @property {string}              version       - Application version from `getAppVersion()`
 * @property {import('@server/controllers/health').MemoryUsage} memoryUsage - Raw heap metrics from the memory check
 * @property {Object}              checks        - Individual subsystem statuses
 * @property {import('@server/controllers/health').DataServiceCheckStatus}  checks.dataService
 * @property {import('@server/controllers/health').FilesystemCheckStatus}   checks.filesystem
 * @property {import('@server/controllers/health').MemoryCheckStatus}       checks.memory
 * @property {import('@server/controllers/health').LastScrapeCheckStatus}   checks.lastScrape
 * @property {string|null}         lastScrapeAt  - ISO timestamp of the last scraper heartbeat, or null
 * @property {string}              responseTime  - Total time taken to run all checks (e.g. `"12ms"`)
 */

/**
 * Derives an overall {@link OverallHealthStatus} from individual check statuses.
 *
 * - `"unhealthy"` — any check returned `"error"`
 * - `"degraded"`  — any check returned `"unhealthy"` or `"warning"`
 * - `"healthy"`   — all checks returned `"healthy"`
 *
 * @param {string[]} checkValues
 * @returns {OverallHealthStatus}
 */
function deriveOverallStatus(checkValues) {
  if (checkValues.some((s) => s === "error")) return "unhealthy";
  if (checkValues.some((s) => s === "unhealthy" || s === "warning"))
    return "degraded";
  return "healthy";
}

/**
 * Health check endpoint that reports application and subsystem statuses.
 *
 * Runs all subsystem checks in parallel and derives an overall status.
 * Responds with HTTP 200 for `"healthy"` and `"degraded"`, HTTP 503 for `"unhealthy"`.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function getHealth(req, res, next) {
  const startTime = Date.now();

  try {
    const [
      dataService,
      filesystem,
      { memoryCheck: memory, memoryUsage },
      lastScrape,
    ] = await Promise.all([
      statusOfDataService(),
      statusOfFilesystem(),
      statusOfMemory(),
      statusOfLastScrape(),
    ]);
    const checks = { dataService, filesystem, memory, lastScrape: lastScrape.status };
    const status = deriveOverallStatus(Object.values(checks));

    /** @type {HealthCheckResponse} */
    const body = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? "development",
      version: getAppVersion(),
      memoryUsage,
      checks,
      lastScrapeAt: lastScrape.lastRunAt,
      responseTime: `${Date.now() - startTime}ms`,
    };

    const statusCode = status === "unhealthy" ? 503 : 200;
    res.status(statusCode).json(body);
  } catch (error) {
    logError("Health", "Health check failed", error);
    error.statusCode = 503;
    next(error);
  }
}
