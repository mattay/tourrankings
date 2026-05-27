import dataService from "@services/dataServiceInstance";
import { logError } from "@utils/logging";

/**
 * Checks whether the data service has been initialized.
 *
 * @returns {"healthy" | "unhealthy" | "check failed"}
 */
export function statusOfDataService() {
  let status = "check failed";
  try {
    const isInitialized = dataService.isInitialized ?? false;
    status = isInitialized ? "healthy" : "unhealthy";
  } catch (error) {
    status = "unhealthy";
    logError("Health", "Data service check failed", error);
  }

  return status;
}
