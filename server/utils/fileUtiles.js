// @ts-check
import fs from "fs/promises";
import path from "path";

/**
 * Read directory contents
 * @param {string} dirPath - Directory path
 * @returns {Promise<Array>} List of files
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
 * Check if a file is a CSV file
 * @param {string} filename - File name
 * @returns {boolean} True if file is CSV
 */
export function isCSVFile(filename) {
  return path.extname(filename).toLowerCase() === ".csv";
}

/**
 * Get file stats
 * @param {string} filePath - File path
 * @returns {Promise<Object>} File stats
 */
export async function getFileStatus(filePath) {
  try {
    return await fs.stat(filePath);
  } catch (error) {
    throw new Error(`Failed to get file stats: ${error.message}`);
  }
}
