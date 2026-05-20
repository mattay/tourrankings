import { fetchHtmlWithCache } from "@scrappers/html/fetch";
import { htmlDOM } from "@scrappers/html/domParser";
import { generateId } from "@cycling/idGenerator";
import {
  dropColumns,
  EXPECTED_COLUMN_SCHEMAS,
  extractNotice,
  formatRow,
  sortByRanking,
  validateTableSchema,
} from "@scrappers/source/proCyclingStats/helpers/helperRaceStageResults";
import { renameKeys } from "@utils/object";
import { toCamelCase } from "@utils/string";
import { stringToSeconds } from "@utils/time";
import { logError, logOut } from "@utils/logging";

/** @typedef {import('@models/@types/races').RaceStageModel} StageDetails */

/**
 * @typedef {Object} StageResultEntry
 * @property {number|string} rank - Ranking position
 * @property {number} bib - Rider bib number
 * @property {string} rider - Rider name
 * @property {number} [uci] - UCI points (gc only)
 * @property {string} [gcBonis] - Bonus seconds (gc only)
 * @property {string} time - Finish time
 * @property {string} timeWonLost - Time gained/lost
 * @property {string} delta - Time gap
 * @property {string} stageUID - Stage unique ID
 * @property {number} stage - Stage number
 */

/**
 * @typedef {Object} IntermediateResultEntry
 * @property {number|string} rank - Ranking position
 * @property {number} bib - Rider bib number
 * @property {string} rider - Rider name
 * @property {string} location - Sprint/climb location
 * @property {string} distance - Distance into stage
 * @property {string} category - Category (1-HC, 1, 2, 3) or "sprint"
 * @property {string} points - Points earned
 * @property {string} bonis - Bonus seconds
 * @property {string} stageUID - Stage unique ID
 * @property {number} stage - Stage number
 */

/**
 * @typedef {Object} ClassificationResults
 * @property {StageResultEntry[]} general - Main classification results
 * @property {IntermediateResultEntry[]} [today] - Intermediate results (points, kom, youth, teams only)
 */

/**
 * @typedef {Object} StageResults
 * @property {ClassificationResults} [stage] - Stage results (general only)
 * @property {ClassificationResults} [gc] - GC (general only)
 * @property {ClassificationResults} [points] - Points classification
 * @property {ClassificationResults} [kom] - Mountains/KOM classification
 * @property {ClassificationResults} [youth] - Youth classification
 * @property {ClassificationResults} [teams] - Teams classification
 */

const DOM_SELECTORS = {
  classificationTabs: ".page-content ul.resultTabs li",
  classificationResult: "#resultsCont .resTab",
  generalTab: ".general",
  todayTab: ".today",

  table: {
    headers: "thead th",
    rows: "tbody tr",
    cells: "td",
  },
};

/**
 * Renames the scraped column name
 * @param {string} column - the html column name
 * @returns {string} - the column name to be used when stored
 */
function tableHeaders(column) {
  const rename = {
    rnk: "rank",
    pnt: "points",
    pnt2: "points",
    uci_pnt: "uci",
    "▼▲": "change", // delta
    "": "bonis",
    prev: "previous stage ranking",
    bib: "bib",
    teamnamelink: "team",
    teamline: "team",
    ridername: "rider",
    gc_timelag: "timelag",
    time_Wonlost: "timeWonLost",
    deltaPnt: "deltaPoints",
  };

  return rename[column] || column;
}

/**
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpStageTable(table, additionalValues) {
  const columnsToDrop = ["h2h", "specialty", "age", "avg"];

  const sorted = table.sort(sortByRanking);

  const cleaned = sorted.reduce((cleaned, row, index) => {
    row = renameKeys(row, tableHeaders);

    if (Object.hasOwn(row, "rank")) {
      let value = row["rank"];

      if (isNaN(value)) {
        row["status"] = value;
        row["rank"] = "";
        // DNF = Did not finish
        // DNS = Did not start
        // OTL = Outside time limit
        // DF = Did finish, no result
        // NR = No result
      }
    } else {
      logError("PCS Stage Results", "No rank in row", null, row);
    }

    // ▼▲ - Convert to integers
    if (Object.hasOwn(row, "delta")) {
      let value = row["delta"];
      if (value.startsWith("▲")) {
        row["change"] = parseInt(value.slice(1), 10);
      } else if (value.startsWith("▼")) {
        row["change"] = -parseInt(value.slice(1), 10);
      }
    }

    // Strip team from rider
    if (Object.hasOwn(row, "rider") && Object.hasOwn(row, "team")) {
      row["rider"] = row["rider"].replace(row["team"], "").trim();
    }

    // Record actual time
    if (Object.hasOwn(row, "time")) {
      let time, delta;

      if (index == 0) {
        if (row["rank"] !== "1") {
          logError(
            "PCS Stage Result",
            "First position should have rank 1",
            null,
            row,
          );
        }
        time = stringToSeconds(row["time"]);
        delta = 0;
      } else {
        const firstPosition = cleaned[0];
        const previousPosition = cleaned[index - 1];

        if (row["time"] == ",,") {
          // Same time as previous
          delta = previousPosition["delta"];
        } else if (row["time"] == "-" || row["time"] == "") {
          // Rider Abandoned
          delta = 0;
        } else {
          delta = stringToSeconds(row["time"]);
        }

        if (row["time"] == "-" || row["time"] == "") {
          time = null;
        } else {
          time = firstPosition["time"] + delta;
        }
      }
      // Update time and delta
      row["time"] = time;
      row["delta"] = delta;
    }

    // Drop Team if rider is recorded
    const dropList = [...columnsToDrop];
    if (Object.hasOwn(row, "bib") && Object.hasOwn(row, "team")) {
      dropList.push("team");
    }
    // Drop not needed
    row = dropColumns(row, dropList);

    cleaned.push(renameKeys({ ...row, ...additionalValues }, toCamelCase));
    return cleaned;
  }, []);

  const formatted = cleaned.map(formatRow);

  return formatted;
}

/**
 * Cleans up the locations table (intermediate sprints/climbs) from a stage results page.
 * Sorts rows by locationIndex, renames keys via tableHeaders, merges additionalValues,
 * then converts all keys to camelCase.
 *
 * @param {Array<Object>} table - Raw location rows, each containing a locationIndex field
 *   used for sorting. Other keys are raw column names from the scraped HTML.
 * @param {Object} additionalValues - Additional values (e.g., stageUID, stage) merged
 *   into each row before key normalization.
 * @returns {Array<Object>} Array of cleaned location rows sorted by locationIndex,
 *   with keys renamed via tableHeaders then converted to camelCase.
 *   Important fields include: locationIndex, location, distance, category, points, bonis.
 */
function cleanUpLocationsTable(table, additionalValues) {
  const sorted = table.sort((a, b) => a["locationIndex"] - b["locationIndex"]);

  const cleaned = sorted.map((row) => {
    return renameKeys({ ...row, ...additionalValues }, toCamelCase);
  });

  return cleaned;
}

/**
 * Cleans up the youth stage day table (today tab).
 * Keeps only normalized fields: rank, time, timeWonlost.
 * Drops redundant fields that exist in RaceRider.
 *
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpYouthContestTable(table, additionalValues) {
  // Keep: rank, time, rider (links to RaceRider)
  // Drop: specialty, age, team, bib, timeWonLost
  const columnsToDrop = [
    "h2h",
    "specialty",
    "age",
    "team",
    "bib",
    "timeWonLost",
  ];

  const sorted = table.sort(sortByRanking);

  const cleaned = sorted.reduce((cleaned, row) => {
    row = renameKeys(row, tableHeaders);

    if (Object.hasOwn(row, "rank")) {
      let value = row["rank"];

      if (isNaN(value)) {
        row["status"] = value;
        row["rank"] = null;
      } else {
        row["rank"] = parseInt(value, 10);
      }
    } else {
      logError("PCS Stage Results", "No rank in row", null, row);
    }

    // Strip team from rider
    if (Object.hasOwn(row, "rider") && Object.hasOwn(row, "team")) {
      row["rider"] = row["rider"].replace(row["team"], "").trim();
    }

    // For stage day data, keep raw time values
    if (Object.hasOwn(row, "time")) {
      if (row["time"] === ",,") {
        row["time"] = "0:00";
      } else if (row["time"] === "-" || row["time"] === "") {
        row["time"] = "";
      }
    }

    // Rename to camelCase and add additional values first
    const renamedRow = renameKeys({ ...row, ...additionalValues }, toCamelCase);

    // Drop not needed columns after camelCase conversion
    const finalRow = dropColumns(renamedRow, columnsToDrop);

    cleaned.push(finalRow);
    return cleaned;
  }, []);

  return cleaned;
}

/**
 * Cleans up the teams stage day table (today tab).
 * Keeps only normalized fields: rank, team, classification, time, timeWonlost.
 *
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpTeamsContestTable(table, additionalValues) {
  // Keep: rank, team, classification, time
  // Drop: timeWonlost (not needed)
  const columnsToDrop = ["h2h", "timeWonlost"];

  const sorted = table.sort(sortByRanking);

  const cleaned = sorted.reduce((cleaned, row) => {
    row = renameKeys(row, tableHeaders);

    if (Object.hasOwn(row, "rank")) {
      let value = row["rank"];

      if (isNaN(value)) {
        row["status"] = value;
        row["rank"] = null;
      } else {
        row["rank"] = parseInt(value, 10);
      }
    } else {
      logError("PCS Stage Results", "No rank in row", null, row);
    }

    // For stage day data, keep raw time values
    if (Object.hasOwn(row, "time")) {
      if (row["time"] === ",,") {
        row["time"] = "0:00";
      } else if (row["time"] === "-" || row["time"] === "") {
        row["time"] = "";
      }
    }

    // Rename to camelCase and add additional values first
    const renamedRow = renameKeys({ ...row, ...additionalValues }, toCamelCase);

    // Drop not needed columns after camelCase conversion
    const finalRow = dropColumns(renamedRow, columnsToDrop);

    cleaned.push(finalRow);
    return cleaned;
  }, []);

  return cleaned;
}

/**
 * Cleans up the points stage day table (today tab) for points classification.
 * Handles points, bonus seconds, and location data from intermediate sprints and finish.
 *
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpPointsLocationContestTable(table, additionalValues) {
  // Keep only normalized fields: rank, points, bonis, today, locationUID
  // Drop redundant fields that exist in other tables: specialty, age, team, locationName, distance, sprintType, bib
  const columnsToDrop = [
    "h2h",
    "specialty",
    "age",
    "team",
    "locationName",
    "distance",
    "sprintType",
    "rider",
  ];

  // Don't sort - keep data grouped by location as extracted from HTML
  const cleaned = table.reduce((cleaned, row) => {
    row = renameKeys(row, tableHeaders);

    // Skip entries with empty bib (neutralized race - no bonuses awarded)
    if (!row["bib"] || row["bib"] === "") {
      return cleaned;
    }

    // Additional column renaming specific to points stage day tables
    // Check for original column names (before camelCase conversion)
    if (Object.hasOwn(row, "pnt")) {
      row["points"] = row["pnt"];
      delete row["pnt"];
    }
    if (Object.hasOwn(row, "result_boni")) {
      row["bonis"] = row["result_boni"];
      delete row["result_boni"];
    }
    if (Object.hasOwn(row, "delta_pnt")) {
      row["today"] = row["delta_pnt"];
      delete row["delta_pnt"];
    }

    if (Object.hasOwn(row, "rank")) {
      let value = row["rank"];

      if (isNaN(value)) {
        row["status"] = value;
        row["rank"] = "";
      }
    } else {
      logError("PCS Stage Results", "No rank in row", null, row);
    }

    // ▼▲ - Convert to integers
    if (Object.hasOwn(row, "change")) {
      let value = row["change"];
      if (value.startsWith("▲")) {
        row["change"] = parseInt(value.slice(1), 10);
      } else if (value.startsWith("▼")) {
        row["change"] = -parseInt(value.slice(1), 10);
      }
    }

    // Strip team from rider
    if (Object.hasOwn(row, "rider") && Object.hasOwn(row, "team")) {
      row["rider"] = row["rider"].replace(row["team"], "").trim();
    }

    // Handle today (cumulative points) - empty becomes 0
    if (
      Object.hasOwn(row, "today") &&
      (row["today"] === "" ||
        row["today"] === null ||
        row["today"] === undefined)
    ) {
      row["today"] = 0;
    }

    // Convert numeric fields to integers
    const numericFields = [
      "stage",
      "rank",
      "bib",
      "age",
      "points",
      "today",
      "change",
      "position",
    ];
    for (const field of numericFields) {
      if (
        Object.hasOwn(row, field) &&
        row[field] !== "" &&
        row[field] !== "-" &&
        row[field] !== null &&
        row[field] !== undefined
      ) {
        const parsed = parseInt(row[field], 10);
        if (!isNaN(parsed)) {
          row[field] = parsed;
        }
      }
    }

    // Ensure distance is a number
    if (Object.hasOwn(row, "distance") && typeof row["distance"] === "string") {
      const parsed = parseFloat(row["distance"]);
      if (!isNaN(parsed)) {
        row["distance"] = parsed;
      }
    }

    // Drop not needed columns
    row = dropColumns(row, columnsToDrop);

    cleaned.push(renameKeys({ ...row, ...additionalValues }, toCamelCase));
    return cleaned;
  }, []);

  return cleaned;
}

/**
 * Cleans up the KOM stage day table (today tab) for mountains classification.
 * Handles KOM points and location data from climbs.
 *
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpMountainLocationContestTable(table, additionalValues) {
  // Keep only normalized fields: rank, points, today, locationUID
  // Drop redundant fields that exist in other tables: specialty, age, team, locationName, distance, category, bib
  const columnsToDrop = [
    "h2h",
    "specialty",
    "age",
    "team",
    "locationName",
    "distance",
    "category",
    "rider",
  ];

  // Don't sort - keep data grouped by location as extracted from HTML
  const cleaned = table.reduce((cleaned, row) => {
    row = renameKeys(row, tableHeaders);

    // Skip entries with empty bib (neutralized race - no bonuses awarded)
    if (!row["bib"] || row["bib"] === "") {
      return cleaned;
    }

    // Additional column renaming specific to KOM stage day tables
    // Check for original column names (before camelCase conversion)
    if (Object.hasOwn(row, "pnt")) {
      row["points"] = row["pnt"];
      delete row["pnt"];
    }
    if (Object.hasOwn(row, "delta_pnt")) {
      row["today"] = row["delta_pnt"];
      delete row["delta_pnt"];
    }

    if (Object.hasOwn(row, "rank")) {
      let value = row["rank"];

      if (isNaN(value)) {
        row["status"] = value;
        row["rank"] = "";
      }
    } else {
      logError("PCS Stage Results", "No rank in row", null, row);
    }

    // ▼▲ - Convert to integers
    if (Object.hasOwn(row, "change")) {
      let value = row["change"];
      if (value.startsWith("▲")) {
        row["change"] = parseInt(value.slice(1), 10);
      } else if (value.startsWith("▼")) {
        row["change"] = -parseInt(value.slice(1), 10);
      }
    }

    // Strip team from rider
    if (Object.hasOwn(row, "rider") && Object.hasOwn(row, "team")) {
      row["rider"] = row["rider"].replace(row["team"], "").trim();
    }

    // Handle today (cumulative KOM points) - empty becomes 0
    if (
      Object.hasOwn(row, "today") &&
      (row["today"] === "" ||
        row["today"] === null ||
        row["today"] === undefined)
    ) {
      row["today"] = 0;
    }

    // Convert numeric fields to integers
    const numericFields = [
      "stage",
      "rank",
      "bib",
      "age",
      "points",
      "today",
      "change",
      "position",
    ];
    for (const field of numericFields) {
      if (
        Object.hasOwn(row, field) &&
        row[field] !== "" &&
        row[field] !== "-" &&
        row[field] !== null &&
        row[field] !== undefined
      ) {
        const parsed = parseInt(row[field], 10);
        if (!isNaN(parsed)) {
          row[field] = parsed;
        }
      }
    }

    // Ensure distance is a number
    if (Object.hasOwn(row, "distance") && typeof row["distance"] === "string") {
      const parsed = parseFloat(row["distance"]);
      if (!isNaN(parsed)) {
        row["distance"] = parsed;
      }
    }

    // Drop not needed columns
    row = dropColumns(row, columnsToDrop);

    cleaned.push(renameKeys({ ...row, ...additionalValues }, toCamelCase));
    return cleaned;
  }, []);

  return cleaned;
}

/**
 *
 * @param {string} label - The label for the sprint.
 * @returns {{location: string, distance: string}} The parsed sprint label.
 */
export function sprintLocation(label) {
  // Define patterns to try in order
  const sprintPatterns = [
    /^(?<title>Sprint|.+? Sprint) \| (?<location>.*) \((?<distance>\d+\.?\d+) km\)/i,
    /^(?<title>Sprint|.+? Sprint) \((?<distance>\d+\.?\d+) km\)/i,
  ];
  const sprint = {
    location: label,
    distance: "",
    sprintType: /finish/i.test(label) ? "finish" : "intermediate",
    title: "",
  };

  // Handle finish-only labels that carry no additional info
  if (/^(Points at finish|Finish)$/i.test(label)) {
    return sprint;
  }

  // Handle bare sprint labels with no location/distance (e.g. "Sprint", "Sprint 1", "Sprint 2")
  if (/^Sprint( \d+)?$/i.test(label)) {
    return sprint;
  }

  // Try each pattern until one matches
  for (const regex of sprintPatterns) {
    const match = label.match(regex);
    if (match) {
      sprint.location = match.groups.location || label;
      sprint.distance = match.groups.distance || "";
      sprint.title = match.groups.title || "";
      return sprint;
    }
  }

  // No pattern matched - log error (except for Finish)
  if (!sprint.distance && /finish/i.test(label)) {
    logError(
      "PCS Stage Results",
      `Label for Sprint points does not match: ${label}`,
    );
  }

  return sprint;
}

/**
 *
 * @param {string} label - The label for the climb.
 * @returns {{category: string, location: string, distance: string}} The parsed climb label.
 */
export function climbLocation(label) {
  // Define patterns to try in order
  const komPatterns = [
    // Pattern: "KOM Sprint (3) Location (123.4 km)" - original, number category (1,2,3,HC)
    /^KOM Sprint \((?<category>\d+|HC)\) (?<location>.*) \((?<distance>\d+(\.\d+)?) km\)/,
    // Pattern: "KOM Sprint (S) Location (123.4 km)" - letter category (S, etc.)
    /^KOM Sprint \((?<category>[A-Z])\) (?<location>.*) \((?<distance>\d+(\.\d+)?) km\)/,
    // Pattern: "KOM Sprint | Location (123.4 km)" - no category, has pipe
    /^KOM Sprint \| (?<location>.*) \((?<distance>\d+(\.\d+)?) km\)/,
    // Pattern: "KOM Sprint (3) Location 123.4 km)" - missing pipe, no paren before distance
    /^KOM Sprint \((?<category>\d+|HC)\) (?<location>.*?) (?<distance>\d+(\.\d+)?) km\)/,
  ];

  const climb = {
    category: "",
    location: "",
    distance: "",
    sprintType: label.includes("finish") ? "Finish" : "Intermediate",
  };

  // Try each pattern until one matches
  for (const regex of komPatterns) {
    const match = label.match(regex);
    if (match) {
      climb.category = match.groups.category || "";
      climb.location = match.groups.location || "";
      climb.distance = match.groups.distance || "";
      return climb;
    }
  }

  // No pattern matched - log error
  logError(
    "PCS Stage Results",
    `Label for KOM points does not match: ${label}`,
  );

  return climb;
}

/**
 *
 * @param {Array<Object>} tables - The tables for the race.
 * @param {StageDetails} stageDetails - The details of the stage.
 * @returns {Object} The cleaned up stage rankings.
 */
export function cleanUpStages(tables, stageDetails) {
  const stageRankings = {};

  for (const [classification, rankings] of Object.entries(tables)) {
    const additionalValues = {
      stageUID: stageDetails.stageUID,
      stage: stageDetails.stage,
    };
    if (Object.hasOwn(rankings, "general")) {
      stageRankings[classification] = cleanUpStageTable(
        rankings["general"],
        additionalValues,
      );
    }

    // Process tables in "today tabs" to capture stage day results for youth and teams
    if (Object.hasOwn(rankings, "today")) {
      if (
        Object.hasOwn(rankings["today"], "locations") &&
        rankings["today"]["locations"].length !== 0
      ) {
        stageRankings[`${classification}Locations`] = cleanUpLocationsTable(
          rankings["today"]["locations"],
          { ...additionalValues, year: stageDetails.year },
        );
      }

      // Use appropriate cleanup based on classification type
      if (classification === "points") {
        stageRankings[`${classification}LocationContest`] =
          cleanUpPointsLocationContestTable(
            rankings["today"]["results"],
            additionalValues,
          );
      } else if (classification === "mountains") {
        stageRankings[`${classification}LocationContest`] =
          cleanUpMountainLocationContestTable(
            rankings["today"]["results"],
            additionalValues,
          );
      } else if (classification === "youth") {
        stageRankings[`${classification}Contest`] = cleanUpYouthContestTable(
          rankings["today"]["results"],
          additionalValues,
        );
      } else if (classification === "teams") {
        stageRankings[`${classification}Contest`] = cleanUpTeamsContestTable(
          rankings["today"]["results"],
          additionalValues,
        );
      }
    }
  }

  return stageRankings;
  // DNF=Did not finish / DNS=Did not start / OTL = Outside time limit / DF=Did finish, no result / NR=No result
}

/**
 * Extracts column headers from a table element.
 *
 * @param {Element} htmlDOM - The HTML DOM element containing the table.
 * @param {string} selector - The CSS selector for the table element.
 * @returns {Array} An array of column headers.
 */
function columnHeader(htmlDOM, selector) {
  return Array.from(htmlDOM.querySelectorAll(selector)).map(
    (header) => header.getAttribute("data-code") ?? header.textContent,
  );
}

/**
 * Extracts the content of a table cell.
 *
 * @param {Element} cell - The HTML DOM element representing the table cell.
 * @returns {string} The content of the table cell.
 */
function extractTableCellContent(cell) {
  // Skip cells that are clearly non-data (checkboxes, buttons, etc.)
  if (
    cell.querySelector('input[type="checkbox"], button, input[type="radio"]')
  ) {
    return "";
  }

  // Handle time cells with hidden spans
  if (cell.classList.contains("time")) {
    // Always remove hidden spans first
    cell.querySelectorAll("span.hide").forEach((span) => {
      span.remove();
    });

    const font = cell.querySelector("font");
    let time;

    // Special case: font ONLY contains commas (,,) return exactly that
    if (font && /^,+$/.test(font.textContent.trim())) {
      time = font.textContent.trim();
    } else {
      // All other cases: get COMPLETE visible time from cell
      time = cell.textContent.trim();
    }

    return time;
  }

  // Handle specialty cells with specific structure
  if (cell.classList.contains("specialty")) {
    const specialtySpan = cell.querySelector("span.fs10");
    if (specialtySpan) {
      return specialtySpan.textContent;
    }
  }

  // Handle rider name cells - extract only the main name, ignore team info
  if (cell.classList.contains("ridername")) {
    const nameLink = cell.querySelector("a");
    if (nameLink) {
      return nameLink.textContent;
    }
  }

  // Standard cell content extraction with cleanup
  let cellContent = cell.textContent;

  // Clean up multi-line content and unwanted text
  if (cellContent.includes("\n")) {
    // Split by newlines and take only the first non-empty line
    const lines = cellContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.match(/^(fav_gc|favorite)$/i));
    cellContent = lines[0] || "";
  }

  // Remove common unwanted text patterns
  cellContent = cellContent
    .replace(/\b(fav_gc|favorite)\b/gi, "") // Remove fav_gc and favorite text
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  return cellContent;
}

/**
 * Extracts the classification table from the HTML DOM.
 * @param {Element} htmlDOM - The HTML DOM element containing the classification table.
 * @param {StageDetails} stageDetails - The details of the stage.
 * @param {ColumnSchema} [schema] - Schema defining expected column data-code values for validation.
 *   If provided, the table is validated against the schema before extraction; mismatches cause early return.
 * @returns {Array} An array of classification table data.
 */
function extractClassificationTable(htmlDOM, stageDetails, schema) {
  const columns = columnHeader(htmlDOM, DOM_SELECTORS.table.headers);

  // Validate table schema if provided
  if (schema && !validateTableSchema(columns, schema)) {
    logOut(
      "PCS Stage Results",
      "Schema validation failed; skipping table extraction for this section.",
      "warn",
    );
    return [];
  }

  const rows = [];
  const notices = [];

  Array.from(htmlDOM.querySelectorAll(DOM_SELECTORS.table.rows)).forEach(
    (row, index) => {
      const cells = Array.from(row.querySelectorAll(DOM_SELECTORS.table.cells));
      const rowDetails = {};

      if (cells.length == 1) {
        notices.push({
          row: index,
          ...extractNotice(cells[0]),
        });
        return;
      } else if (cells.length < columns.length) {
        logOut(
          "PCS Stage Results",
          `Row ${index}: ${cells.length} cells fall short of expected ${columns.length} columns`,
          "warn",
        );
        return;
      } else if (cells.length > columns.length) {
        logOut(
          "PCS Stage Results",
          `Row ${index}: ${cells.length} cells exceeds expected ${columns.length} columns, extra cells will be ignored`,
          "warn",
        );
      }

      // Process each cell
      for (
        let columnIndex = 0;
        columnIndex < Math.min(cells.length, columns.length);
        columnIndex += 1
      ) {
        const columnLabel = columns[columnIndex];
        const cell = cells[columnIndex];
        const cellContent = extractTableCellContent(cell);

        rowDetails[columnLabel] = cellContent;
      }

      rows.push(rowDetails);
    },
  );

  notices.forEach((notice) => {
    if (notice.type === "relegation") {
      logOut(
        "PCS Stage Results",
        `Row ${notice.row}, Rider ${notice.riderName} relegated from ${notice.from} to ${notice.to} ${notice.reason ? `for ${notice.reason}` : ""}`,
        "warn",
      );
      // TO FIX: Rider name is captured as LastName FirstName
      const riderIndex = rows.findIndex(
        (row) => row.ridername === notice.riderName,
      );
      if (riderIndex !== -1) {
        // TODO append to rider result
        // logOut("PCS Stage Results", rows[riderIndex]);
      }
    } else if (notice.type === "unknown") {
      logOut(
        "PCS Stage Results",
        `Row ${notice.row}: unrecognised notice — ${notice.content}`,
        "debug",
      );
    } else {
      logOut(
        "PCS Stage Results",
        `Row ${notice.row}: ${notice.type} is not a valid notice type`,
        "error",
      );
    }
  });
  return rows;
}

/**
 * Extracts classification results from a table element.
 *
 * @param {HTMLElement} htmlDOM - The HTML DOM element containing the table.
 * @param {Array} classificationsList - An array of classification names.
 * @param {StageDetails} stageDetails - Details about the stage.
 * @param {string} selector - The CSS selector for the table element.
 * @returns {Object} An object containing classification results.
 */
export function classificationResults(
  htmlDOM,
  classificationsList,
  stageDetails,
  selector = DOM_SELECTORS.classificationResult,
) {
  if (!["Prologue", "ITT", "TTT", ""].includes(stageDetails.stageType)) {
    logOut(
      "PCS Stage Results",
      `Unexpected stage type [${stageDetails.stageType}]`,
      "warn",
    );
    return {};
  }

  const classificationStageResults = {};

  const classificationResultsSelection = Array.from(
    htmlDOM.querySelectorAll(selector),
  );

  for (let i = 0; i < classificationResultsSelection.length; i++) {
    let classification = classificationsList[i];
    if (!classification) {
      logOut(
        "PCS Stage Results",
        `No classification tab for result container at index ${i}`,
        "warn",
      );
      continue;
    }
    if (classification === "kom" || classification === "qom") {
      classification = "mountains";
    }
    classificationStageResults[classification] = {};

    // General tab
    const generalTable = classificationResultsSelection[i].querySelector(
      DOM_SELECTORS.generalTab,
    );
    if (generalTable) {
      if (stageDetails.stageType === "TTT") {
        logOut(
          "PCS Stage Results",
          `Classification ${classification} for stage type [TTT] not implemented`,
          "warn",
        );
      } else if (
        stageDetails.stageType === "" ||
        stageDetails.stageType === "ITT" ||
        stageDetails.stageType === "Prologue"
      ) {
        classificationStageResults[classification]["general"] =
          extractClassificationTable(
            generalTable,
            stageDetails,
            EXPECTED_COLUMN_SCHEMAS[classification]?.general,
          );
      } else {
        logOut(
          "PCS Stage Results",
          `Unexpected stage type [${stageDetails.stageType}]`,
          "warn",
        );
      }
    }

    // Today tabs
    const todayTabs = classificationResultsSelection[i].querySelectorAll(
      DOM_SELECTORS.todayTab,
    );
    if (todayTabs.length > 0) {
      classificationStageResults[classification]["today"] = {};
      // For youth and teams, there's only one table per today tab
      // For points and kom, there are multiple tables (intermediate sprints/climbs)
      const todayTabLocationResults = [];
      const todayTabLocations = [];

      todayTabs.forEach((todayTab) => {
        // Get all tables within this today tab
        const todayTables = todayTab.querySelectorAll("table");
        const h4Labels = todayTab.querySelectorAll("h4");

        if (h4Labels.length !== todayTables.length) {
          logOut(
            "Scrape PCS - Stage Results",
            `Mismatch: ${h4Labels.length} h4 labels vs ${todayTables.length} tables in today tab`,
            "warn",
          );
        }

        todayTables.forEach((table, htmlIndex) => {
          const h4Label = h4Labels[htmlIndex]?.textContent?.trim() ?? "";
          let locationIndex = htmlIndex + 1;
          // Only generate locationType for valid types, skip for youth/teams
          const validLocationTypes = ["points", "mountains"];
          const locationType = validLocationTypes.includes(classification)
            ? classification
            : null;
          const locationUID = locationType
            ? generateId.location(
                stageDetails.stageUID,
                locationIndex,
                locationType,
              )
            : null;
          let locationInfo = {
            locationUID,
            locationIndex,
            locationType,
            allocatedPoints: [],
            allocatedBoni: [],
          };

          // Determine correct locationType and generate locationUID
          if (classification === "mountains") {
            locationInfo = {
              ...locationInfo,
              ...climbLocation(h4Label),
            };
          }
          if (classification === "points") {
            locationInfo = {
              ...locationInfo,
              ...sprintLocation(h4Label),
            };
          }

          const tableData = extractClassificationTable(
            table,
            stageDetails,
            EXPECTED_COLUMN_SCHEMAS[classification]?.today,
          );

          for (let i = 0; i < tableData.length; i++) {
            const contestent = tableData[i];

            // Collect location allocated points and bonis
            if (classification === "points" || classification === "mountains") {
              contestent.locationUID = locationUID;
              let rankIndex = parseInt(contestent?.rnk) - 1;
              let points = contestent?.pnt;
              let boni = contestent?.result_boni;
              if (points)
                locationInfo.allocatedPoints[rankIndex] = parseInt(points);
              if (boni) locationInfo.allocatedBoni[rankIndex] = boni;
            }
            todayTabLocationResults.push(contestent);
          }
          // Wait for all allocated points and bonis at location
          if (classification === "points" || classification === "mountains") {
            if (tableData.length > 0) {
              todayTabLocations.push(locationInfo);
            }
          }
        });
      });

      if (todayTabLocations.length > 0) {
        // console.table(todayLocations);
        classificationStageResults[classification]["today"]["locations"] =
          todayTabLocations;
      }

      if (todayTabLocationResults.length > 0) {
        // console.table(todayLocationResults);
        classificationStageResults[classification]["today"]["results"] =
          todayTabLocationResults;
      }
    }
  }

  return classificationStageResults;
}

/**
 * Extract classification titles from the HTML DOM
 * @param {HTMLElement} htmlDOM - Document object from DOMParser
 * @param {string} selector - CSS selector for classification tabs
 * @returns {Array<string>} - Array of classification titles
 */
export function getClassificationsFromTabs(
  htmlDOM,
  selector = DOM_SELECTORS.classificationTabs,
) {
  try {
    return Array.from(htmlDOM.querySelectorAll(selector)).map(
      (classification, index) => {
        const anchor = classification.querySelector("a");
        if (!anchor) {
          logError(
            "PCS Stage Results",
            `Missing <a> element in classification tab at index ${index}`,
            null,
            classification.outerHTML,
          );
          return ""; // Return empty string to preserve array length
        }

        return anchor.textContent.toLowerCase().trim() || "";
      },
    );
  } catch (exception) {
    logError("PCS Stage Results", "Failed to parse HTML", exception);
    throw exception;
  }
}

/**
 *
 * @param {string} htmlContent - HTML content of the page
 * @param {StageDetails} stageDetails - Stage details
 * @returns {StageResults} - Stage results
 */
export function extractStageClassificationResultsFromHTML(
  htmlContent,
  stageDetails,
) {
  const pageDOM = htmlDOM(htmlContent);

  // Collect Tabs Listed -> Make no assumptions about tab structure
  const classificationList = getClassificationsFromTabs(pageDOM);
  const stageClassificationResults = classificationResults(
    pageDOM,
    classificationList,
    stageDetails,
  );

  const results = cleanUpStages(stageClassificationResults, stageDetails);

  return results;
}

/**
 * Scrape race stage results from ProCyclingStats
 * @param {string} race - Race name
 * @param {StageDetails} stageDetails - Stage details
 * @returns {Promise<StageResults|null>} Stage results or null on empty/invalid HTML
 * @throws {Error} Throws if network or parsing fails
 */
export async function scrapeRaceStageResults(race, stageDetails) {
  const urlStage =
    stageDetails.stage === 0 ? "prologue" : `stage-${stageDetails.stage}`;
  const url = `https://www.procyclingstats.com/race/${race}/${stageDetails.year}/${urlStage}`;
  const cachePattern = `${race}-${stageDetails.year}-${urlStage}`;

  try {
    const htmlContent = await fetchHtmlWithCache(url, { cachePattern });
    if (!htmlContent?.html || htmlContent.html === "") {
      logError(
        "Scrape PCS - Stage Results",
        "Empty or invalid HTML response",
        null,
        { url },
      );

      return null;
    }

    return extractStageClassificationResultsFromHTML(
      htmlContent.html,
      stageDetails,
    );
  } catch (exception) {
    logError("PCS Stage Results", `Failed to process '${url}'`, exception);
    throw exception;
  }
}
