import fs from "fs/promises";
import path from "path";
import config from "../config";
import { readDir, isCSVFile } from "../utils/fileUtiles";

/**
 * Retrieves the names of all available datasets (CSV files) in the data directory.
 *
 * @async
 * @returns {Promise<string[]>} Resolves to an array of dataset names (without .csv extension).
 * @throws {Error} If reading the directory fails.
 */
export async function getDataSets() {
  try {
    const files = await readDir(config.paths.data.public);
    return files
      .filter((file) => isCSVFile(file))
      .map((file) => path.basename(file, ".csv"));
  } catch (error) {
    throw new Error(`Failed to get datasets: ${error.message}`);
  }
}

/**
 * Retrieves information about a specific dataset.
 *
 * @async
 * @param {string} name - The name of the dataset (without .csv extension).
 * @returns {Promise<{
 *   name: string,
 *   size: number,
 *   lastModified: Date,
 *   type: string
 * } | null>} Resolves to an object with dataset info, or null if not found.
 * @throws {Error} If reading file stats fails for reasons other than non-existence.
 */
export async function getDatasetInfo(name) {
  try {
    const filePath = path.join(config.paths.data.public, `${name}.csv`);

    try {
      // Check if file exists
      await fs.access(filePath);
    } catch (error) {
      return null; // File doesn't exist
    }

    const stats = await fs.stat(filePath);

    return {
      name,
      size: stats.size,
      lastModified: stats.mtime,
      type: "csv",
    };
  } catch (error) {
    throw new Error(`Failed to get dataset info: ${error.message}`);
  }
}

/**
 * Reads and returns the content of a specific dataset as a string.
 *
 * @async
 * @param {string} name - The name of the dataset (without .csv extension).
 * @returns {Promise<string>} Resolves to the content of the dataset as a string.
 * @throws {Error} If reading the file fails.
 */
export async function getDatasetContent(name) {
  try {
    const filePath = path.join(config.paths.data.public, `${name}.csv`);
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to get dataset content: ${error.message}`);
  }
}
