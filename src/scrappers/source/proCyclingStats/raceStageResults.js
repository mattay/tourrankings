import { generateId } from "@utils/idGenerator";
import { renameKeys } from "@utils/object";
import { toCamelCase } from "@utils/string";
import { addTime, formatSeconds, stringToSeconds } from "@utils/time";
import { logError, logOut } from "@utils/logging";
import { fetchHtmlWithFetch } from "src/scrappers/fetch";
import { htmlDOM } from "src/scrappers/domParser";

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

  return table
    .sort((a, b) => {
      return parseInt(a.rnk) - parseInt(b.rnk);
    })
    .map((row, index, rankings) => {
      row = renameKeys(row, tableHeaders);

      // if (index <= 3) {
      //   console.log("cleanUpStageTable [PRE]", index, row);
      // }

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
      }

      // ▼▲
      if (Object.hasOwn(row, "change")) {
        // row["Change"] = row["▼▲"];
        // delete row["▼▲"];

        let value = row["change"];
        if (value.startsWith("▲")) {
          row["change"] = value.slice(1);
        } else if (value.startsWith("▼")) {
          row["change"] = -value.slice(1);
        }
      }

      // Strip team from rider
      if (Object.hasOwn(row, "rider") && Object.hasOwn(row, "team")) {
        row["rider"] = row["rider"].replace(row["team"], "").trim();
      }

      // Record actual time
      if (Object.hasOwn(row, "time")) {
        // console.log("cleanUpStageTable [TIME]", row["time"]);

        if (index == 0) {
          // First position
          // console.log(index, row);
          // console.log(index + 1, rankings[index + 1]);
          //
          row["time"] = formatSeconds(stringToSeconds(row["time"]));
          row["delta"] = "0:00";
        } else {
          const firstPosition = rankings[0];
          const previousPosition = rankings[index - 1];

          if (row["time"] == "-") {
            // Rider Abandoned
            row["time"] = null;
          } else if (row["time"] == ",,") {
            // Same time a previous
            // console.log(
            //   "cleanUpStageTable [TIME]",
            //   index - 1,
            //   row["time"],
            //   previousPosition["time"],
            // );
            row["delta"] = previousPosition["delta"];
          } else {
            row["delta"] = row["time"];
          }

          //FIX ?? These may a conflict here referencing the previous position which is not updated

          row["time"] = formatSeconds(
            addTime(firstPosition["time"], row["delta"]),
          );
        }
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
          case "previous rtage ranking":
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
          default:
            break;
        }
        row[key] = value;
      }

      return renameKeys({ ...row, ...additionalValues }, toCamelCase);
    });
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
      "Race Stage Results",
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
      "Race Stage Results",
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
 * @param {string} stageUID - The ID of the stage.
 * @param {number} stage - The number of the stage.
 * @returns {Object} The cleaned up stage rankings.
 */
function cleanUpStages(tables, stageUID, stage) {
  const stageRankings = {};

  for (const [classification, rankings] of Object.entries(tables)) {
    if (Object.hasOwn(rankings, "general")) {
      stageRankings[classification] = cleanUpStageTable(rankings["general"], {
        stageUID,
        stage,
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
    // console.log("Time cell content:", cell.innerHTML);
    let defaultTime = cell.querySelector("font");
    let time = defaultTime?.textContent || "";

    if (defaultTime && defaultTime.classList.length > 0) {
      // const subSeconds = time;
      time = cell.childNodes[0]?.textContent || "";
    } else if (defaultTime) {
      time = defaultTime.textContent;
      // console.log("[<font/>]\t", cell.innerHTML);
      // console.log("[<font/>]\t", time);
    } else if (!defaultTime) {
      time = cell.childNodes[0]?.textContent || "";
      // console.log("[No <font/>]\t", cell.innerHTML);
      // console.log("[No <font/>]\t", time);
    } else {
      console.log("[Else>]\t", cell.innerHTML);
      time = defaultTime.textContent;
    }

    // const hiddenSpan = cell.querySelector("span.hide");
    // cell.remove();
    // if (hiddenSpan) {
    //   return hiddenSpan.textContent;
    // }

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
 * @returns {Array} An array of classification table data.
 */
function extractClassificationTable(htmlDOM) {
  const columns = columnHeader(htmlDOM, DOMSELECTORS.table.headers);

  const rows = Array.from(
    htmlDOM.querySelectorAll(DOMSELECTORS.table.rows),
  ).map((row, index) => {
    // console.log(`Processing row ${index}`);
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
        "Race Stage Results",
        `Row ${index}: ${cells.length} cells fall short of ${columns.length} columns`,
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
        "Race Stage Results",
        `Row ${index}: ${cells.length} cells exceed ${columns.length} columns, extra cells will be ignored`,
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

    return rowDetails;
  });
  return rows;
}

/**
 * Extracts classification results from a table element.
 *
 * @param {Document} htmlDOM - The HTML DOM element containing the table.
 * @param {Array} classificationsList - An array of classification names.
 * @param {string} selector - The CSS selector for the table element.
 * @returns {Object} An object containing classification results.
 */
function classificationResults(
  htmlDOM,
  classificationsList,
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
      classificationStageResults[classification]["general"] =
        extractClassificationTable(generalTable);
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
function classificationsTabs(
  htmlDOM,
  selector = DOMSELECTORS.classificationTabs,
) {
  try {
    return Array.from(htmlDOM.querySelectorAll(selector)).map(
      (classification) => {
        const title = classification.querySelector("a").textContent;
        return title.toLowerCase() || "";
      },
    );
  } catch (exception) {
    logError("Scrape PCS - Stage Results", "Failed to parse HTML", exception);
    return [];
  }
}

/**
 *
 * @param {import('puppeteer-core').Page} page - Page object from Puppeteer
 * @param {string} race - Race name
 * @param {number} year - Year of the race
 * @param {number} stage - Stage number
 */
export async function scrapeRaceStageResults(page, race, year, stage) {
  const urlStage = stage === 0 ? "prologue" : `stage-${stage}`;
  const url = `https://www.procyclingstats.com/race/${race}/${year}/${urlStage}`;
  const raceId = generateId.race(race, year);
  const stageUID = generateId.stage(raceId, stage);

  try {
    const htmlContent = await fetchHtmlWithFetch(url);
    const pageDOM = htmlDOM(htmlContent);

    // Collect Tabs Listed -> Make no assumptions about tab structure
    const classificationList = classificationsTabs(pageDOM);
    // logOut("Race Stage Results", `Tabs: ${classificationList}`);
    const stageClassificationResults = classificationResults(
      pageDOM,
      classificationList,
    );
    // logOut("Race Stage Results", `Results: ${stageClassificationResults}`);
    // console.table(stageClassificationResults["STAGE"]["general"]);
    return cleanUpStages(stageClassificationResults, stageUID, stage);
  } catch (exception) {
    logError("Race Stage Results", `Failed to Navigate to '${url}'`, exception);
    return null;
  }
}
