import fs from "fs/promises";
import { constants as fsConstants } from "fs";
import config from "@server/config";
import { logError } from "@utils/logging";

/**
 * @typedef {import('./types').FilesystemCheckStatus} FilesystemCheckStatus
 */

/**
 * Checks whether the data directory is accessible for reading.
 *
 * The target directory is resolved from the `DATA_DIR` environment variable,
 * falling back to `config.dataService.dataDir` when absent.
 *
 * @returns {Promise<FilesystemCheckStatus>}
 *   - `"healthy"`   — the data directory exists and is readable
 *   - `"unhealthy"` — the directory is missing (`ENOENT`) or permission is denied (`EACCES`)
 *   - `"error"`     — an unexpected error occurred while checking the directory
 */
export async function statusOfFilesystem() {
  const dataDir = process.env.DATA_DIR || config.dataService.dataDir;

  try {
    await fs.access(dataDir, fsConstants.R_OK);
    return "healthy";
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EACCES") {
      return "unhealthy";
    }
    logError("Health", "Filesystem check failed", error);
    return "error";
  }
}
