import { generateId } from "../../../utils/idGenerator";
import { renameKeys } from "../../../utils/object";
import { toCamelCase } from "../../../utils/string";
import { addTime, formatSeconds } from "../../../utils/time";
import { logError, logOut } from "../../../utils/logging";
/**
 * Renames the scraped column name
 * @param {string} column - the html column name
 * @returns {string} - the column name to be used when stored
 */
function tableHeaders(column) {
  const rename = {
    Rnk: "Rank",
    Pnt: "Points",
    "▼▲": "Change",
    "": "Bonis",
    Prev: "Previous Stage Ranking",
    "#": "Rank",
    BIB: "Bib",
  };

  return rename[column] || column;
}

/**
 * @param {Array<Object>} table - The table to clean up.
 * @param {Object} additionalValues - Additional values to add to each row.
 * @returns {Array<Object>} The cleaned up table.
 */
function cleanUpStageTable(table, additionalValues) {
  const drop = ["H2H", "Specialty", "Age"];

  return table
    .sort((a, b) => {
      return parseInt(a.Rnk) - parseInt(b.Rnk);
    })
    .map((row, index, rankings) => {
      row = renameKeys(row, tableHeaders);

      if (Object.hasOwn(row, "Rank")) {
        let value = row["Rank"];

        if (isNaN(value)) {
          row["Status"] = value;
          row["Rank"] = "";
          // DNF = Did not finish
          // DNS = Did not start
          // OTL = Outside time limit
          // DF = Did finish, no result
          // NR = No result
        }
      }

      // ▼▲
      if (Object.hasOwn(row, "Change")) {
        // row["Change"] = row["▼▲"];
        // delete row["▼▲"];

        let value = row["Change"];
        if (value.startsWith("▲")) {
          row["Change"] = value.slice(1);
        } else if (value.startsWith("▼")) {
          row["Change"] = -value.slice(1);
        }
      }

      // Strip team from rider
      if (Object.hasOwn(row, "Rider") && Object.hasOwn(row, "Team")) {
        row["Rider"] = row["Rider"].replace(row["Team"], "").trim();
      }

      // Record actual time
      if (Object.hasOwn(row, "Time")) {
        if (index == 0) {
          // First position
          row["Delta"] = "0:00";
        } else {
          const firstPosition = rankings[0];
          const previousPosition = rankings[index - 1];

          if (row["Time"] == "-") {
            // Rider Abandoned
            row["Time"] = null;
          } else if (row["Time"] == ",,") {
            // Same time a previous
            row["Delta"] = previousPosition["Delta"];
          } else {
            row["Delta"] = row["Time"];
          }

          row["Time"] = formatSeconds(
            addTime(firstPosition["Time"], row["Delta"]),
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
      if (Object.hasOwn(row, "Bib") && Object.hasOwn(row, "Team")) {
        delete row["Team"];
      }

      // Format values
      for (let key of Object.keys(row)) {
        let value = row[key];
        switch (key) {
          case "Stage":
          case "Rank":
          case "Previous Stage Ranking":
          case "GC":
          case "Bib":
          case "UCI":
          case "Points":
          case "Today":
          case "Change":
          case "Position":
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

  const resultsIndex = [
    { tab: "stage" },
    { tab: "gc" },
    { tab: "points" },
    { tab: "kom" },
    { tab: "youth" },
    { tab: "teams" },
  ];

  for (let index = 0; index < tables.length; index += 1) {
    const tab = resultsIndex[index].tab || null;

    // Accumulated times and points rankings
    if (tab && Object.hasOwn(tables[index], "general")) {
      const general = cleanUpStageTable(tables[index]["general"], {
        stageUID,
        stage,
      });
      stageRankings[tab] = general;
    } else {
      logOut(
        "cleanUpStages",
        `${tab}, ${index} ${Object.keys(tables[index]).join(", ")}`,
        "debug",
      );
    }

    if (
      tab &&
      Object.hasOwn(tables[index], "today") &&
      tables[index]["today"] != null
    ) {
      for (let i = 0; i < tables[index]["today"].length; i += 1) {
        const ranking = tables[index]["today"][i];
        let table = [];

        switch (tab) {
          case "points":
            stageRankings[tab + "-location"] = cleanUpStageTable(
              ranking.standings,
              {
                stageUID,
                stage,
                ...sprint(ranking.label),
              },
            );
            break;

          case "kom":
            stageRankings[tab + "-location"] = cleanUpStageTable(
              ranking.standings,
              {
                stageUID,
                stage,
                ...climb(ranking.label),
              },
            );
            break;

          case "youth":
          case "teams":
            stageRankings[tab + "-day-classification"] = cleanUpStageTable(
              ranking.standings,
              { stageUID, stage },
            );
            break;

          default:
            logOut("Clean Up Stages", `Ranking: ${ranking.label}`, "warn");

            table = cleanUpStageTable(ranking.standings, { stageUID, stage });
            stageRankings[tab + "-location"] = table;
            break;
        }
      }
    }
  }

  return stageRankings;
  // DNF=Did not finish / DNS=Did not start / OTL = Outside time limit / DF=Did finish, no result / NR=No result
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

  // Ensure page loads
  try {
    await page.goto(url, { waitUntil: "networkidle2" });
  } catch (exception) {
    logError("Race Stage Results", `Failed to Navigate to '${url}'`, exception);
    return null;
  }

  try {
    // Main page container - waited for to ensure page loads
    await page.waitForSelector(".page-content", {
      timeout: 1200,
    });
  } catch (exception) {
    logError(
      "Race Stage Results",
      `Exception in scrapeStage waiting for  selector '.page-content' on '${url}'`,
      exception,
    );
    return null;
  }

  // Fetch table data
  const tables = await page.evaluate(() => {
    const pageSelectors = {
      // Main results containers
      resultContainers: "#resultsCont .resTab",
      tabsContainer: "ul.tabs.tabnav.resultTabs",
      tabs: "a.selectResultTab",
      // Tab system within each result container
      generalTab: ".general",
      todayTab: ".today",
    };

    // TODO: Collect Tabs Listed -> Make no assumptions about tab structure
    // const tabs = document.querySelectorAll(`${pageSelectors.generalTab}, ${pageSelectors.todayTab}`);

    const resultConts = document.querySelectorAll(
      pageSelectors.resultContainers,
    );

    /**
     * Extracts content from a table cell with specialized handling for different cell types
     * @param {HTMLTableCellElement} cell - The table cell element
     * @returns {string} The extracted cell content
     */
    function extractCellContent(cell) {
      // Skip cells that are clearly non-data (checkboxes, buttons, etc.)
      if (
        cell.querySelector(
          'input[type="checkbox"], button, input[type="radio"]',
        )
      ) {
        return "";
      }

      // Handle time cells with hidden spans
      if (cell.classList.contains("time")) {
        const hiddenSpan = cell.querySelector("span.hide");
        if (hiddenSpan) {
          return hiddenSpan.innerText.trim();
        }
      }

      // Handle specialty cells with specific structure
      if (cell.classList.contains("specialty")) {
        const specialtySpan = cell.querySelector("span.fs10");
        if (specialtySpan) {
          return specialtySpan.innerText.trim();
        }
      }

      // Handle rider name cells - extract only the main name, ignore team info
      if (cell.classList.contains("ridername")) {
        const nameLink = cell.querySelector("a");
        if (nameLink) {
          return nameLink.innerText.trim();
        }
      }

      // Standard cell content extraction with cleanup
      let cellContent = cell.innerText.trim();

      // Clean up multi-line content and unwanted text
      if (cellContent.includes("\n")) {
        // Split by newlines and take only the first non-empty line
        const lines = cellContent
          .split("\n")
          .map((line) => line.trim())
          .filter(
            (line) => line.length > 0 && !line.match(/^(fav_gc|favorite)$/i),
          );
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
     * Extracts structured data from a table DOM element, including standard and special cell types.
     *
     * Iterates through table rows, mapping cell content by column header.
     * Returns special row objects if columns do not match headers.
     *
     * @param {HTMLTableElement} tableElement - Table DOM node to extract data from.
     * @returns {Array<[Object, string[]]>} Array of tuples, each containing a row object (mapping column names to cell content, or special row objects with 'type' property) and an array of warnings for that row
     * @note Returns special row objects (type: "nonResult" or "columnCount") when row structure doesn't match expected columns
     */
    function extractTableData(tableElement) {
      const tableStructure = {
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
      };

      const columns = Array.from(
        tableElement.querySelectorAll(tableStructure.headers),
      ).map((cell) => cell.innerText.trim());
      // TODO: cell.getAttribute('data-code') ?? cell.innerText.trim())

      const rows = Array.from(
        tableElement.querySelectorAll(tableStructure.rows),
      );

      return rows.map((row, index) => {
        const cells = Array.from(row.querySelectorAll(tableStructure.cells));
        const rowDetails = {};
        const warnings = [];

        if (cells.length < columns.length) {
          if (cells.length == 1) {
            return [
              {
                type: "nonResult",
                value: cells[0].innerText,
                row: index,
              },
              [],
            ];
          }
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
          warnings.push(
            `Row ${index}: ${cells.length} cells exceed ${columns.length} columns, extra cells will be ignored`,
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
          let cellContent = "";
          try {
            cellContent = extractCellContent(cell);
          } catch (error) {
            console.warn(
              `Failed to extract cell content at column ${columnIndex}:`,
              error,
            );
          }
          rowDetails[columnLabel] = cellContent;
        }

        return [rowDetails, warnings];
      });
    }

    const results = /** @type {Object[]} */ [];
    for (const [index, resultCont] of resultConts.entries()) {
      results[index] = {
        general: null,
        today: null,
      };

      // Tab [General]
      const general = resultCont.querySelector(pageSelectors.generalTab);
      if (general) {
        results[index]["general"] = extractTableData(
          general.querySelector("table"),
        );
      }

      // Tab [Today]
      const today = resultCont.querySelector(pageSelectors.todayTab);
      if (today) {
        const pairs = [];
        const headers = today.querySelectorAll("h4");
        const tables = today.querySelectorAll("table");

        for (
          let pair = 0;
          pair < headers.length && pair < tables.length;
          pair += 1
        ) {
          const tableData = extractTableData(tables[pair]);
          const standings = tableData.map(([row, _]) => row);
          const warnings = tableData.flatMap(([_, warns]) => warns);
          pairs.push({
            label: headers[pair].innerText,
            standings,
            warnings,
          });
        }
        results[index]["today"] = pairs;
      }
    }

    return results;
  });

  tables.forEach((result, index) => {
    if (result.general) {
      const tableData = result.general;
      result.general = tableData.map(([row]) => row);
      const warnings = tableData.flatMap(([_, warns]) => warns);
      warnings.forEach((warning) => {
        logOut("Race Stage Results", warning, "warn");
      });
    }
    if (result.today) {
      result.today.forEach((pair) => {
        if (pair.warnings && pair.warnings.length > 0) {
          pair.warnings.forEach((warning) => {
            logOut("Race Stage Results", warning, "warn");
          });
        }
      });
    }
  });

  return cleanUpStages(tables, stageUID, stage);
}
