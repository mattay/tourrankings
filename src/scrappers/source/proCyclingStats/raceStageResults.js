import { generateId } from "@utils/idGenerator";
import { renameKeys } from "@utils/object";
import { toCamelCase } from "@utils/string";
import { addTime, formatSeconds, stringToSeconds } from "@utils/time";
import { logError, logOut } from "@utils/logging";
import { fetchHtmlWithFetch } from "@scrappers/fetch";
import { htmlDOM } from "@scrappers/domParser";

/** @typedef {import('@models/@types/races').RaceStageModel} StageDetails */

const DOMSELECTORS = {
  // Classification tabs
  classificationTabs: ".page-content ul.resultTabs li",
  // Main results containers
  classificationResult: "#resultsCont .resTab",
  tabs: "a.selectResultTab",
  // Tab system within each result container
  generalTab: ".general",
  todayTab: ".today",

  table: {
    // Standard table elements
    headers: "thead th", // Column headers
    rows: "tbody tr", // Data rows
    cells: "td", // Individual cells (both header and data)
    // Special cell types with custom handling
    timeCells: {
      selector: 'cell.classList.contains("time")',
      nestedSpan: "span", // Time display element
      nestedDiv: "div", // Actual time value
    },
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
    uci_pnt: "uci",
    "▼▲": "change",
    "": "bonis",
    prev: "previous stage ranking",
    "#": "rank",
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
  const drop = ["h2h", "specialty", "age"];

  return (
    table
      .sort((a, b) => {
        return parseInt(a.rnk) - parseInt(b.rnk);
      })
      // .map((row, index, rankings) => {
      .reduce((cleaned, row, index) => {
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

        // ▼▲
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
              // Same time a previous
              delta = stringToSeconds(previousPosition["delta"]);
            } else {
              delta = stringToSeconds(row["time"]);
            }

            if (row["time"] == "-" || row["time"] == "") {
              // Rider Abandoned
              time = null;
            } else {
              time = stringToSeconds(firstPosition["time"]) + delta;
            }
          }
          // Update time and delta
          row["time"] = time;
          row["delta"] = delta;
        }

        // Drop not needed
        for (const column of drop) {
          if (Object.hasOwn(row, column)) {
            delete row[column];
          }
        }

        // Drop Team
        if (Object.hasOwn(row, "bib") && Object.hasOwn(row, "team")) {
          delete row["team"];
        }

        // Format values
        for (let key of Object.keys(row)) {
          let value = row[key];
          switch (key) {
            case "stage":
            case "rank":
            case "previous stage ranking":
            case "gc":
            case "bib":
            case "uci":
            case "points":
            case "today":
            case "change":
            case "position":
              // String to Int
              if (value != "-" && value != "") {
                value = parseInt(value, 10);
              } else if (value == "-") {
                value = "";
              }
              break;
            case "time":
            case "delta":
              // Int to Time string
              if (value > 0) {
                value = formatSeconds(value);
              } else {
                value = "";
              }
              break;
            default:
              break;
          }
          row[key] = value;
        }

        cleaned.push(renameKeys({ ...row, ...additionalValues }, toCamelCase));
        return cleaned;
      }, [])
  );
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
      stageRankings[classification] = cleanUpStageTable(rankings["general"], {
        stageUID: stageDetails.stageUID,
        stage: stageDetails.stage,
      });
    }

    // TODO
    // if (
    //   tab &&
    //   Object.hasOwn(tables[index], "today") &&
    //   tables[index]["today"] != null
    // ) {
    //   for (let i = 0; i < tables[index]["today"].length; i += 1) {
    //     const ranking = tables[index]["today"][i];
    //     let table = [];

    //     switch (tab) {
    //       case "points":
    //         stageRankings[tab + "-location"] = cleanUpStageTable(
    //           ranking.standings,
    //           {
    //             stageUID,
    //             stage,
    //             ...sprint(ranking.label),
    //           },
    //         );
    //         break;

    //       case "kom":
    //         stageRankings[tab + "-location"] = cleanUpStageTable(
    //           ranking.standings,
    //           {
    //             stageUID,
    //             stage,
    //             ...climb(ranking.label),
    //           },
    //         );
    //         break;

    //       case "youth":
    //       case "teams":
    //         stageRankings[tab + "-day-classification"] = cleanUpStageTable(
    //           ranking.standings,
    //           { stageUID, stage },
    //         );
    //         break;

    //       default:
    //         logOut("Clean Up Stages", `Ranking: ${ranking.label}`, "warn");

    //         table = cleanUpStageTable(ranking.standings, { stageUID, stage });
    //         stageRankings[tab + "-location"] = table;
    //         break;
    //     }
    //   }
    // }
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
 * @param {StageDetails} stageDetails - The details of the stage.
 * @returns {string} The content of the table cell.
 */
function extractTableCellContent(cell, stageDetails) {
  // Skip cells that are clearly non-data (checkboxes, buttons, etc.)
  if (
    cell.querySelector('input[type="checkbox"], button, input[type="radio"]')
  ) {
    return "";
  }

  // Handle time cells with hidden spans
  if (cell.classList.contains("time")) {
    // Always remove hidden spans first
    cell.querySelectorAll("span.hide").forEach((span) => span.remove());

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
  const columns = columnHeader(htmlDOM, DOMSELECTORS.table.headers);

  const rows = Array.from(
    htmlDOM.querySelectorAll(DOMSELECTORS.table.rows),
  ).map((row, index) => {
    const cells = Array.from(row.querySelectorAll(DOMSELECTORS.table.cells));
    const rowDetails = {};

    if (cells.length == 1) {
      return [
        {
          type: "nonResult",
          value: cells[0].textContent,
          row: index,
        },
      ];
    }
    if (cells.length < columns.length) {
      logOut(
        "PCS Stage Results",
        `Row ${index}: ${cells.length} cells fall short of expected ${columns.length} columns`,
        "warn",
      );
      return [
        {
          type: "columnCount",
          value: cells.length,
          row: index,
        },
        [],
      ];
    }
    if (cells.length > columns.length) {
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
      const cellContent = extractTableCellContent(cell, stageDetails);

      rowDetails[columnLabel] = cellContent;
    }

    return rowDetails;
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
  selector = DOMSELECTORS.classificationResult,
) {
  const classificationStageResults = {};

  const classificationResultsSelection = Array.from(
    htmlDOM.querySelectorAll(selector),
  );

  for (let i = 0; i < classificationResultsSelection.length; i++) {
    const classification = classificationsList[i];
    classificationStageResults[classification] = {};

    const generalTable = classificationResultsSelection[i].querySelector(
      DOMSELECTORS.generalTab,
    );
    // TODO: Implement extraction of general classification results
    // const todayTables = classificationResultsSelection[i].querySelector(
    //   DOMSELECTORS.todayTab,
    // );

    if (generalTable) {
      switch (stageDetails.stageType) {
        case "TTT":
          logOut(
            "PCS Stage Results",
            `Classification ${classification} for stage type [TTT] not implemented`,
            "warn",
          );
          break;
        case "ITT":
        case "prologue":
        default:
          classificationStageResults[classification]["general"] =
            extractClassificationTable(generalTable, stageDetails);
          break;
      }
    }

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
  selector = DOMSELECTORS.classificationTabs,
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
    return [];
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
    const htmlContent = await fetchHtmlWithFetch(url);
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
    logError("PCS Stage Results", `Failed to Navigate to '${url}'`, exception);
    return null;
  }
}
