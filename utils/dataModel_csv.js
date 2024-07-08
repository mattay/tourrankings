import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { toCamelCase, toTitleCase } from "./string.js";

class CSVdataModel {
  rows = [];

  /**
   * Creates an instance of CsvHandler.
   * @param {string} filePath - The path to the CSV file.
   * @param {Array<string>} indexOn - An array of strings representing the columns to index on.
   */
  constructor(filePath, indexOn) {
    this.filePath = path.resolve(filePath);
    this.indexOn = indexOn.map((index) => toCamelCase(index));
    this.sortOrder = [];
    this.csvHeaders = [""];
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
        console.warn(`Incoming CSV row missing index ${key}`);
        console.log(Object.keys(result));
        return null;
      }
    }

    return result;
  }

  async #readFromCSV() {
    return new Promise((resolve, reject) => {
      // Removed existing data
      this.rows.length = 0;

      // Check if the file exists
      if (!fs.existsSync(this.filePath)) {
        // Create file with headers
        console.warn("Creating database", this.filePath);
        this.#writeToCSV();
      } else {
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
      }
    });
  }

  async #writeToCSV() {
    let csvContent = `${this.csvHeaders.join(",")}\n`;

    const columns = this.csvHeaders.map(toCamelCase);
    this.rows.forEach((row) => {
      const rowData = columns.map((column) => row[column]).join(",");
      csvContent += `${rowData}\n`;
    });

    fs.writeFileSync(this.filePath, csvContent, "utf8");
  }

  async read() {
    return await this.#readFromCSV();
  }

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

  async update(updates) {
    await this.read(); // Refresh

    updates.forEach((entry) => {
      for (const key of this.indexOn) {
        if (!entry.hasOwnProperty(key)) {
          console.warn(
            `[${this.constructor.name}] Update row missing index ${key}`,
          );
          console.error(Object.keys(entry));
          throw new Error("Invalid Update");
        }
      }
    });

    this.rows = [...this.rows, ...this.#newEntries(updates)];
    this.sortRows();
    await this.write();
  }

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
