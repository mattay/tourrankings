// @ts-check
import fs from "fs/promises";
import path from "path";

/**
 * Reads the contents of a directory and returns a list of file names.
 *
 * @async
 * @param {string} dirPath - Absolute or relative path to the directory.
 * @returns {Promise<string[]>} Resolves to an array of file names in the directory.
 * @throws {Error} If the directory cannot be read.
 */
export async function readDir(dirPath) {
  try {
    const files = await fs.readdir(dirPath);
    return files;
  } catch (error) {
    throw new Error(`Failed to read directory: ${error.message}`);
  }
}

/**
 * Checks if a file name has a .csv extension (case-insensitive).
 *
 * @param {string} filename - Name of the file to check.
 * @returns {boolean} True if the file is a CSV file, false otherwise.
 */
export function isCSVFile(filename) {
  return path.extname(filename).toLowerCase() === ".csv";
}

/**
 * Retrieves file statistics for a given file path.
 *
 * @async
 * @param {string} filePath - Absolute or relative path to the file.
 * @returns {Promise<import('fs').Stats>} Resolves to a Stats object describing the file.
 * @throws {Error} If the file stats cannot be retrieved.
 */
export async function getFileStatus(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}
