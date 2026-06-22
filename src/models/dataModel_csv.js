import path from "path";
import fs from "fs";
import csv from "csv-parser";
import { toCamelCase } from "@utils/string";
import { logError, logOut } from "@utils/logging";
import { dirname } from "path";

/**
 * Generic data model for managing CSV file data.
 *
 * Provides methods for reading, writing, updating, and sorting rows of data from a CSV file.
 * Designed to be extended by subclasses for specific data shapes and business logic.
 */
class CSVdataModel {
  /** @type {Array<Object>} */
  rows = [];

  /**
   * Represents a data handler for a CSV file with indexed columns.
   *
   * @param {string} filePath - Path to the CSV file.
   * @param {string[]} indexOn - Array of column names to use as indexes.
   *
   * @property {string} filePath - Absolute path to the CSV file.
   * @property {string[]} indexOn - Array of column names (camelCased) used as indexes.
   * @property {string[]} csvHeaders - List of CSV column headers expected in the file.
   * @property {Array.<Array.<string>>} sortOrder - Array of [column, direction] pairs for sorting.
   * @property {Object.<string, string>} fieldTypes - Object mapping field names to their expected types.
   */
  constructor(filePath, indexOn, fieldTypes = {}) {
    this.filePath = path.resolve(filePath);
    this.indexOn = indexOn.map((index) => toCamelCase(index));
    this.sortOrder = [];
    this.csvHeaders = [];
    this.fieldTypes = fieldTypes;
  }

  /**
   * Converts a string value to the specified type.
   * @param {string} value - The input string value.
   * @param {string} type - The type to convert to ('number', 'boolean', etc.).
   * @returns {any} The converted value.
   */
  #convertType(value, type) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    switch (type) {
      case "number":
        // Use parseFloat for decimal values and parseInt for integers
        return isNaN(parseFloat(value)) ? value : parseFloat(value);
      case "boolean":
        return value.toLowerCase() === "true";
      case "date":
        return new Date(value);
      default:
        return value;
    }
  }

  /**
   * Converts all keys in an object to camelCase valid JavaScript variable names.
   * @param {Object} obj - The input object.
   * @returns {Object} The object with camelCase keys.
   */
  #cleanRowCSV(obj) {
    const result = {};

    // convert table headers and apply typing
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        const camelCaseKey = toCamelCase(key);
        const value = obj[key];
        // Apply type conversion if a field type is specified
        if (this.fieldTypes[camelCaseKey]) {
          result[camelCaseKey] = this.#convertType(
            value,
            this.fieldTypes[camelCaseKey],
          );
        } else {
          result[camelCaseKey] = value;
        }
      }
    }

    for (const key of this.indexOn) {
      if (!Object.hasOwn(result, key)) {
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
   * Validates model configuration after initialization.
   * Checks that indexOn, sortOrder, and fieldTypes fields have corresponding csvHeaders.
   * Logs warnings for mismatches but allows operation to continue (lenient).
   */
  validateConfig() {
    // Only validate if csvHeaders are configured
    if (!this.csvHeaders?.length) {
      return;
    }

    const availableCamelHeaders = this.csvHeaders.map((h) => toCamelCase(h));

    // Check indexOn fields
    if (this.indexOn?.length > 0) {
      const missingIndexFields = this.indexOn.filter((camelKey) => {
        const hasMatchingHeader = availableCamelHeaders.includes(camelKey);
        return !hasMatchingHeader;
      });

      if (missingIndexFields.length > 0) {
        logError(
          this.constructor.name,
          `Configuration warning: indexOn fields [${missingIndexFields.join(", ")}] ` +
            `have no matching csvHeaders. Available: [${this.csvHeaders.join(", ")}]. ` +
            `These fields will fail validation when loading data.`,
        );
      }
    }

    // Check sortOrder fields
    if (this.sortOrder?.length > 0) {
      const sortFields = this.sortOrder.map(([field]) => field);
      const availableFields = [
        ...(this.indexOn || []),
        ...availableCamelHeaders,
      ];

      const missingSortFields = sortFields.filter(
        (field) => !availableFields.includes(field),
      );

      if (missingSortFields.length > 0) {
        logError(
          this.constructor.name,
          `Configuration warning: sortOrder fields [${missingSortFields.join(", ")}] ` +
            `not found in indexOn or csvHeaders. Sorting may not work correctly.`,
        );
      }
    }

    // Check fieldTypes keys
    if (this.fieldTypes && Object.keys(this.fieldTypes).length > 0) {
      const fieldTypeKeys = Object.keys(this.fieldTypes);
      const missingFieldTypes = fieldTypeKeys.filter(
        (key) => !availableCamelHeaders.includes(key),
      );

      if (missingFieldTypes.length > 0) {
        logError(
          this.constructor.name,
          `Configuration warning: fieldTypes keys [${missingFieldTypes.join(", ")}] ` +
            `have no matching csvHeaders. Type conversion may not work correctly.`,
        );
      }
    }
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
        
        // Ensure parent directory exists (handles symlinks and real directories)
        const dir = dirname(this.filePath);
        try {
          const stat = fs.statSync(dir);
          if (!stat.isDirectory()) {
            throw new Error(`${dir} exists but is not a directory`);
          }
        } catch (err) {
          if (err.code === "ENOENT") {
            fs.mkdirSync(dir, { recursive: true });
          } else {
            throw err;
          }
        }
        
        this.#writeToCSV();
      }

      // Write to CSV
      // csv-parser skips the header row; first data row is file line 2
      let lineNumber = 2;

      const stream = fs.createReadStream(this.filePath).pipe(csv());
      stream
        .on("data", (data) => {
          const cleanedData = this.#cleanRowCSV(data);
          if (cleanedData) {
            this.rows.push(cleanedData);
            lineNumber++;
          } else {
            // Propagate error through the stream; Promise will reject via "error".
            stream.destroy(
              new Error(
                `Invalid CSV file ${this.filePath} at line ${lineNumber}`,
              ),
            );
          }
        })
        .on("end", () => {
          this.sortRows();
          resolve(this.rows);
        })
        .on("error", reject);
    });
  }

  /**
   * Writes data to the CSV file.
   * @async
   * @returns {Promise<void>} A promise that resolves when the data is written.
   */
  async #writeToCSV() {
    return new Promise((resolve, reject) => {
      let csvContent = `${this.csvHeaders.join(",")}\n`;

      const columns = this.csvHeaders.map(toCamelCase);
      this.rows.forEach((row) => {
        const rowData = columns.map((column) => row[column]).join(",");
        csvContent += `${rowData}\n`;
      });
      try {
        fs.writeFileSync(this.filePath, csvContent, "utf8");
        // logOut(
        //   this.constructor.name,
        //   `Wrote to ${this.filePath} ${fs.existsSync(this.filePath)}`,
        //   "debug",
        // );
      } catch (error) {
        logError(
          this.constructor.name,
          `Failed to write to ${this.filePath}`,
          error,
        );
        reject(error);
      }
      resolve();
    });
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
   * @param {boolean} [quiet=false] - Suppress console.table output for failed entries.
   * @returns {Promise<void>} A promise that resolves when the data is updated.
   */
  async update(updates, quiet = false) {
    await this.read(); // Refresh

    const validated = [];
    const failed = [];
    // Check if results are valid
    updates.forEach((entry) => {
      // const indexed = this.indexOn.every((key) => Object.hasOwn(entry, key));
      const indexed = this.indexOn.every(
        (key) => entry[key] != null && entry[key] !== "",
      );

      if (indexed) {
        validated.push(entry);
      } else {
        failed.push(entry);
      }
    });

    this.rows = [...this.rows, ...this.#newEntries(validated)];
    this.sortRows();
    const writePromise = this.write();

    // Log failed entries while writing
    if (failed.length > 0) {
      logError(this.constructor.name, "Invalid Entries");
      logError(
        this.constructor.name,
        "Expected Keys: " + this.indexOn.join(", "),
      );
      if (!quiet) {
        // eslint-disable-next-line no-console
        console.table(failed);
      }
    }

    await writePromise;
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
