// @ts-check
import fs from "fs/promises";
import path from "path";
import config from "../config";
import { readDir, isCSVFile } from "../utils/fileUtiles";

/**
 * Get list of all available datasets
 * @returns {Promise<Array>} List of dataset names
 */
export async function getDataSets() {
  try {
    const files = await readDir(config.paths.data.public);
    return files
      .filter((file) => isCSVFile(file))
      .map((file) => path.basename(file, ".csv"));
  } catch (error) {
    throw new Error(`Failed to get datasets ${error.message}`);
  }
}

/**
 * Get information about a specific dataset
 * @param {string} name - Dataset name
 * @returns {Promise<Object>} Dataset information
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
 * Get content of a specific dataset
 * @param {string} name - Dataset name
 * @returns {Promise<string>} Dataset content
 */
export async function getDatasetContent(name) {
  try {
    const filePath = path.join(config.paths.data.public, `${name}.csv`);
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    throw new Error(`Failed to get dataset content: ${error.message}`);
  }
}
