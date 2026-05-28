import dataService from "@services/dataServiceInstance";
import { logError } from "@utils/logging";

/**
 * @typedef {import('@server/controllers/health/types').DataServiceCheckStatus} DataServiceCheckStatus
 */

/**
 * Checks whether the data service has been initialised.
 *
 * @returns {DataServiceCheckStatus}
 *   - `"healthy"`   — `dataService.isInitialized` is `true`
 *   - `"unhealthy"` — the service is reachable but not yet initialised
 *   - `"error"`     — accessing the service threw an unexpected error
 */
export function statusOfDataService() {
  try {
    return (dataService.isInitialized ?? false) ? "healthy" : "unhealthy";
  } catch (error) {
    logError("Health", "Data service check failed", error);
    return "error";
  }
}
