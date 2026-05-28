import config from "@server/config";
import { logError } from "@utils/logging";

/** @typedef {import('@server/controllers/health/types').MemoryCheckStatus} MemoryCheckStatus */

/**
 * @typedef {Object} MemoryUsage
 * @property {string} heapUsed  - Heap memory currently allocated (e.g. `"42MB"`)
 * @property {string} heapTotal - Total heap memory available to the process (e.g. `"128MB"`)
 */

/**
 * @typedef {Object} MemoryCheckResult
 * @property {MemoryCheckStatus} memoryCheck
 *   - `"healthy"`  — heap usage is below the configured threshold
 *   - `"warning"`  — heap usage has met or exceeded the configured threshold
 *   - `"error"`    — `process.memoryUsage()` threw an unexpected error
 * @property {MemoryUsage} memoryUsage - Raw heap figures; empty strings when the check errors
 */

/**
 * Checks current heap usage against a configurable warning threshold.
 *
 * Threshold is read from `config.healthCheck.memoryWarningThresholdMB` and
 * defaults to `400 MB` when absent.
 *
 * @returns {MemoryCheckResult}
 */
export function statusOfMemory() {
  /** @type {MemoryCheckResult} */
  const status = {
    memoryUsage: {
      heapUsed: "",
      heapTotal: "",
    },
    memoryCheck: /** @type {MemoryCheckStatus} */ ("error"),
  };

  try {
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const threshold = config.healthCheck?.memoryWarningThresholdMB ?? 400;
    status.memoryCheck = memoryMB < threshold ? "healthy" : "warning";
    status.memoryUsage = {
      heapUsed: `${memoryMB}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    };
  } catch (error) {
    status.memoryCheck = "error";
    logError("Health", "Memory check failed", error);
  }

  return status;
}
