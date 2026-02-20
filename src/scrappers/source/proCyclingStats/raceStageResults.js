import { renameKeys } from "@utils/object";
import { toCamelCase } from "@utils/string";
import { stringToSeconds } from "@utils/time";
import { logError, logOut } from "@utils/logging";
import { fetchHtml } from "@scrappers/html/fetch";
import { htmlDOM } from "@scrappers/html/domParser";
import {
  dropColumns,
  extractNotice,
  formatRow,
  sortByRanking,
} from "./helpers/helperRaceStageResults";

/** @typedef {import('@models/@types/races').RaceStageModel} StageDetails */

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

export function scrapeFromHtmlRacesResults(htmlContent, year) {
  return [];
}

export function scrapeFromHtmlRacesClassificationGeneral(htmlContent, year) {
  return [];
}

export function scrapeFromHtmlRacesClassificationMountains(htmlContent, year) {
  return [];
}

export function scrapeFromHtmlRacesClassificationPoints(htmlContent, year) {
  return [];
}

export function scrapeFromHtmlRacesClassificationTeams(htmlContent, year) {
  return [];
}

export function scrapeFromHtmlRacesClassificationYouth(htmlContent, year) {
  return [];
}

/**
 * Renames the scraped column name
 * @param {string} column - the html column name
 * @returns {string} - the column name to be used when stored
 */
function tableHeaders(column) {
  const rename = {
    rnk: "rank",
    pnt: "points",
    uci_pnt: "uci",
    "▼▲": "change",
    "": "bonis",
    prev: "previous stage ranking",
    bib: "bib",
    teamnamelink: "team",
    teamline: "team",
    ridername: "rider",
    gc_timelag: "timelag",
  };

  return rename[column] || column;
}

/**
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpStageTable(table, additionalValues) {
  const columnsToDrop = ["h2h", "specialty", "age"];

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
 *
 * @param {string} label - The label for the sprint.
 * @returns {{location: string, distance: string}} The parsed sprint label.
 */
function sprint(label) {
  // Sprint -> "Sprint | Dozza (108.1 km)""
  const regexSprintLabel =
    /^Sprint \| (?<location>.*) \((?<distance>\d+\.?\d+) km\)/;

  const sprint = {
    location: label,
    distance: "",
  };

  const matchSprintLabel = label.match(regexSprintLabel);
  if (label != "Points at finish" && !matchSprintLabel) {
    logError(
      "PCS Stage Results",
      `Label for Sprint points does not match: ${label}`,
    );
  } else if (matchSprintLabel) {
    sprint.location = matchSprintLabel.groups.location;
    sprint.distance = matchSprintLabel.groups.distance;
  }

  return sprint;
}

/**
 *
 * @param {string} label - The label for the climb.
 * @returns {{category: string, location: string, distance: string}} The parsed climb label.
 */
function climb(label) {
  // Stage Classification -> "KOM Sprint (3) Côte de San Luca (186.6 km)""
  const regexKomLabel =
    /^KOM Sprint \((?<category>(\d+|HC))\) (?<location>.*) \((?<distance>\d+(\.\d+)?) km\)/;

  const climb = {
    category: "",
    location: "",
    distance: "",
  };

  const matchKomLabel = label.match(regexKomLabel);
  if (!matchKomLabel) {
    logError(
      "PCS Stage Results",
      `Label for KOM points does not match: ${label}`,
    );
  } else {
    climb.category = matchKomLabel.groups.category;
    climb.location = matchKomLabel.groups.location;
    climb.distance = matchKomLabel.groups.distance;
  }

  return climb;
}

/**
 *
 * @param {Array<Object>} tables - The tables for the race.
 * @param {StageDetails} stageDetails - The details of the stage.
 * @returns {Object} The cleaned up stage rankings.
 */
function cleanUpStages(tables, stageDetails) {
  const stageRankings = {};

  for (const [classification, rankings] of Object.entries(tables)) {
    if (Object.hasOwn(rankings, "general")) {
      const additionalValues = {
        stageUID: stageDetails.stageUID,
        stage: stageDetails.stage,
      };
      stageRankings[classification] = cleanUpStageTable(
        rankings["general"],
        additionalValues,
      );
    }

    // TODO: Process tables in "today tabs" to capture intermediate results
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
 * @returns {Array} An array of classification table data.
 */
function extractClassificationTable(htmlDOM, stageDetails) {
  const columns = columnHeader(htmlDOM, DOM_SELECTORS.table.headers);

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
 * @param {Document} htmlDOM - The HTML DOM element containing the table.
 * @param {Array} classificationsList - An array of classification names.
 * @param {StageDetails} stageDetails - Details about the stage.
 * @param {string} selector - The CSS selector for the table element.
 * @returns {Object} An object containing classification results.
 */
function classificationResults(
  htmlDOM,
  classificationsList,
  stageDetails,
  selector = DOM_SELECTORS.classificationResult,
) {
  if (!["prologue", "ITT", "TTT", ""].includes(stageDetails.stageType)) {
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
    const classification = classificationsList[i];
    if (!classification) {
      logOut(
        "PCS Stage Results",
        `No classification tab for result container at index ${i}`,
        "warn",
      );
      continue;
    }
    classificationStageResults[classification] = {};

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
        stageDetails.stageType === "prologue"
      ) {
        classificationStageResults[classification]["general"] =
          extractClassificationTable(generalTable, stageDetails);
      } else {
        logOut(
          "PCS Stage Results",
          `Unexpected stage type [${stageDetails.stageType}]`,
          "warn",
        );
      }
    }

    // TODO: Implement extraction of general classification results
    // const todayTables = classificationResultsSelection[i].querySelector(
    //   DOM_SELECTORS.todayTab,
    // );
    //
    // TODO: Implement extraction of today classification results
    // if (todayTables) {
    //   classificationResults[classification]["today"] =
    //     extractClassificationTable(todayTable);
    // }
  }

  return classificationStageResults;
}

/**
 * Extract classification titles from the HTML DOM
 * @param {Document} htmlDOM - Document object from DOMParser
 * @param {string} selector - CSS selector for classification tabs
 * @returns {Array<string>} - Array of classification titles
 */
function getClassificationsFromTabs(
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

        return anchor.textContent.toLowerCase() || "";
      },
    );
  } catch (exception) {
    logError("PCS Stage Results", "Failed to parse HTML", exception);
    throw exception;
  }
}

/**
 * Scrape race stage results from ProCyclingStats
 * @param {string} race - Race name
 * @param {StageDetails} stageDetails - Stage details
 */
export async function scrapeRaceStageResults(race, stageDetails) {
  const urlStage =
    stageDetails.stage === 0 ? "prologue" : `stage-${stageDetails.stage}`;
  const url = `https://www.procyclingstats.com/race/${race}/${stageDetails.year}/${urlStage}`;

  try {
    const htmlContent = await fetchHtml(url);
    const pageDOM = htmlDOM(htmlContent);

    // Collect Tabs Listed -> Make no assumptions about tab structure
    const classificationList = getClassificationsFromTabs(pageDOM);
    const stageClassificationResults = classificationResults(
      pageDOM,
      classificationList,
      stageDetails,
    );

    return cleanUpStages(stageClassificationResults, stageDetails);
  } catch (exception) {
    logError("PCS Stage Results", `Failed to process '${url}'`, exception);
    throw exception;
  }
}
