import fs from "fs/promises";
import config from "@server/config";
import { logError } from "@utils/logging";

/**
 * Checks whether the data directory is accessible for reading.
 *
 * @returns {Promise<"healthy" | "unhealthy" | "check failed">}
 */
export async function statusOfFilesystem() {
  let status = "check failed";
  const dataDir = process.env.DATA_DIR || config.dataService.dataDir;

  try {
    await fs.access(dataDir, fs.constants.R_OK);
    status = "healthy";
  } catch (error) {
    logError("Health", "Filesystem check failed", error);
    status = "unhealthy";
  }

  return status;
}
