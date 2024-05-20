import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { toCamelCase, toTitleCase } from "./string.js";

class CSVdataModel {
  constructor(filePath, indexOn) {
    this.rows = [];
    this.filePath = path.resolve(filePath);
    this.indexOn = indexOn;
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

    if (!result.hasOwnProperty(this.indexOn)) {
      console.warn(`Incoming CSV row missing index ${this.indexOn}`);
      console.log(result);
      return null;
    }

    return result;
  }

  async #readFromCSV() {
    return new Promise((resolve, reject) => {
      fs.createReadStream(this.filePath)
        .pipe(csv())
        .on("data", (data) => {
          const cleanedData = this.#cleanRowCSV(data);
          if (cleanedData) {
            this.rows.push(cleanedData);
          } else {
            throw new Error("Invalid CSV file", this.filePath);
          }
        })
        .on("end", () => resolve(this.rows))
        .on("error", reject);
    });
  }

  async #writeToCSV() {
    let csvContent = `${this.csvHeaders.join(",")}\n`;

    const columns = this.csvHeaders.map(toCamelCase);
    this.rows.forEach((row) => {
      const rowData = columns.map((column) => row[column]).join(",");
      csvContent += `${rowData}\n`;
    });

    fs.writeFileSync(this.filePath, csvContent);
  }

  async read() {
    return this.#readFromCSV();
  }

  async write() {
    return this.#writeToCSV();
  }

  async update(updates) {
    await this.read(); // Refresh

    updates.forEach((entry) => {
      if (!entry.hasOwnProperty(this.indexOn)) {
        console.warn(`Update row missing index ${this.indexOn}`);
        console.error(result);
        throw new Error("Invalid Update");
      }
    });

    // Filter out existing entries based on raceUrl
    const newEntries = updates.filter((entry) => {
      return !this.rows.some(
        (existingEntry) => existingEntry.raceUrl === entry.raceUrl,
      );
    });

    this.rows = [...this.rows, ...newEntries];
    this.sortRows();
    this.write();
  }

  sortRows() {
    this.rows.sort((a, b) => {
      return new Date(a.startDate) - new Date(b.startDate);
    });
  }
}

export default CSVdataModel;
