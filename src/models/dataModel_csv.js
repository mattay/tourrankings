import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { toCamelCase, toTitleCase } from "../utils/string.js";
import { logError, logOut } from "../utils/logging.js";
import { debug } from "console";

/**
 * Generic data model for managing CSV file data.
 *
 * Provides methods for reading, writing, updating, and sorting rows of data from a CSV file.
 * Designed to be extended by subclasses for specific data shapes and business logic.
 */
class CSVdataModel {
  /** @type {Array<Object>} */
  rows = [];

  constructor(filePath, indexOn) {
    this.filePath = path.resolve(filePath);
    this.indexOn = indexOn.map((index) => toCamelCase(index));
    this.sortOrder = [];
    this.csvHeaders = [];
  }

  /**
   * Converts all keys in an object to camelCase valid JavaScript variable names.
   * @param {Object} obj - The input object.
   * @returns {Object} The object with camelCase keys.
   */
  #cleanRowCSV(obj) {
    const result = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const camelCaseKey = toCamelCase(key);
        result[camelCaseKey] = obj[key];
      }
    }

    for (const key of this.indexOn) {
      if (!result.hasOwnProperty(key)) {
        logError(
          this.constructor.name,
          `Incoming CSV row missing index ${key}`,
        );
        logOut(this.constructor.name, Object.keys(result).join(","), "debug");
        return null;
      }
    }

    return result;
  }

  /**
   * Reads data from a CSV file and populates the rows array.
   * @async
   * @returns {Promise<Array>} A promise that resolves with the array of rows.
   */
  async #readFromCSV() {
    return new Promise((resolve, reject) => {
      // Removed existing cached data
      this.rows.length = 0;

      // Check if the file exists
      if (!fs.existsSync(this.filePath)) {
        // Create file with headers
        logOut(
          this.constructor.name,
          `Creating database ${this.filePath}`,
          "warn",
        );
        fs.mkdirSync(dirname(this.filePath), { recursive: true });
        this.#writeToCSV();
      }

      // Write to CSV
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on("data", (data) => {
          const cleanedData = this.#cleanRowCSV(data);
          if (cleanedData) {
            this.rows.push(cleanedData);
          } else {
            throw new Error(`Invalid CSV file ${this.filePath}`);
          }
        })
        .on("end", () => resolve(this.rows))
        .on("error", reject);

      logOut(this.constructor.name, `Loaded ${this.filePath}`, "debug");
      this.sortRows();
    });
  }

  /**
   * Writes data to the CSV file.
   * @async
   * @returns {Promise<void>} A promise that resolves when the data is written.
   */
  async #writeToCSV() {
    let csvContent = `${this.csvHeaders.join(",")}\n`;

    const columns = this.csvHeaders.map(toCamelCase);
    this.rows.forEach((row) => {
      const rowData = columns.map((column) => row[column]).join(",");
      csvContent += `${rowData}\n`;
    });

    fs.writeFileSync(this.filePath, csvContent, "utf8");
  }

  /**
   * Reads data from the CSV file and populates the rows array.
   * @async
   * @returns {Promise<Array<Object>>} The array of rows read from the CSV file.
   */
  async read() {
    return await this.#readFromCSV();
  }

  /**
   * Writes data to the CSV file.
   * @async
   * @returns {Promise<void>} A promise that resolves when the data is written.
   */
  async write() {
    return await this.#writeToCSV();
  }

  /**
   * Compares two lists of objects and returns entries in list B that do not exist in list A based on specified keys.
   * @param {Array<Object>} updates - The first list of objects.
   * @returns {Array<Object>} The list of new entries in list B that do not exist in list A.
   */
  #newEntries(updates) {
    // Helper function to create a key string from the specified keys
    const createKey = (item) => this.indexOn.map((key) => item[key]).join("|");
    // Create a set of keys from list A for quick lookup
    const indexed = new Set(this.rows.map(createKey));
    // Filter list B to find entries not present in setA
    return updates.filter((record) => !indexed.has(createKey(record)));
  }

  /**
   * Updates the data model with new or modified records.
   * @async
   * @param {Array<Object>} updates - The list of records to update.
   * @returns {Promise<void>} A promise that resolves when the data is updated.
   */
  async update(updates) {
    await this.read(); // Refresh

    updates.forEach((entry) => {
      for (const key of this.indexOn) {
        if (!entry.hasOwnProperty(key)) {
          logError(this.constructor.name, `Update row missing index ${key}`);
          logOut(this.constructor.name, Object.keys(entry), "debug");
          throw new Error("Invalid Update");
        }
      }
    });

    this.rows = [...this.rows, ...this.#newEntries(updates)];
    this.sortRows();
    await this.write();
  }

  /**
   * Sorts the rows in the data model based on the specified order.
   */
  sortRows() {
    this.rows.sort((a, b) => {
      // return new Date(a.startDate) - new Date(b.startDate);
      for (let [key, order] of this.sortOrder) {
        if (a[key] < b[key]) return order === "asc" ? -1 : 1;
        if (a[key] > b[key]) return order === "asc" ? 1 : -1;
      }
      return 0;
    });
  }
}

export default CSVdataModel;
