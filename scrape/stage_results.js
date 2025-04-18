import { Page } from "puppeteer";
import { generateId } from "../src/utils/idGenerator";
import { renameKeys } from "../src/utils/object";
import { toCamelCase } from "../src/utils/string";
import { addTime, formatSeconds } from "../src/utils/time";

/**
 * @param {}
 * @returns {Array<Object>}
 */
function cleanUpStageTable(table, additionalValues) {
  const rename = {
    Rnk: "Rank",
    Pnt: "Points",
    "▼▲": "Change",
    "": "Bonis",
    Prev: "Previous Stage Ranking",
    "#": "Rank",
  };

  return table
    .sort((a, b) => {
      return parseInt(a.Rnk) - parseInt(b.Rnk);
    })
    .map((row, index, rankings) => {
      for (const key in rename) {
        if (row.hasOwnProperty(key)) {
          row[rename[key]] = row[key];
          delete row[key];
        }
      }

      // ▼▲
      if (row.hasOwnProperty("Change")) {
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
      if (row.hasOwnProperty("Rider") && row.hasOwnProperty("Team")) {
        row["Rider"] = row["Rider"].replace(row["Team"], "").trim();
      }

      // Record actual time
      if (row.hasOwnProperty("Time")) {
        if (index == 0) {
          // First position
          row["Delta"] = "0:00";
        } else {
          const firstPosition = rankings[0];
          const previousPosition = rankings[index - 1];

          if (row["Time"] == ",,") {
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

      // Not needed.
      if (row.hasOwnProperty("H2H")) {
        delete row["H2H"];
      }

      // Format values
      for (let key of Object.keys(row)) {
        let value = row[key];
        switch (key) {
          case "Stage":
          case "Rank":
          case "Previous Stage Ranking":
          case "GC":
          case "BIB":
          case "Age":
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
 * @param {string} label
 * @returns
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
    console.error(
      "Label for sprint points does not match: Sprint | <location> (<distance> km)",
    );
    console.warn(label);
  } else if (matchSprintLabel) {
    sprint.location = matchSprintLabel.groups.location;
    sprint.distance = matchSprintLabel.groups.distance;
  }

  return sprint;
}

/**
 *
 * @param {string} label
 * @returns
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
    console.error(
      "Label for KOM points does not match: KOM Sprint (<category>) <location> (<distance> km)",
    );
    console.warn(label);
  } else {
    return matchKomLabel.groups;
  }

  return climb;
}

/**
 *
 * @param {Array<Object>} tables
 * @param {string} stageId
 * @param {number} stage
 * @returns
 */
function cleanUpStages(tables, stageId, stage) {
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
    if (tab && tables[index].hasOwnProperty("general")) {
      const general = cleanUpStageTable(tables[index]["general"], {
        stageId,
        stage,
      });
      stageRankings[tab] = general;
    } else {
      console.error(tab, index, Object.keys(tables[index]));
    }

    if (
      tab &&
      tables[index].hasOwnProperty("today") &&
      tables[index]["today"].length > 0
    ) {
      for (let i = 0; i < tables[index]["today"].length; i += 1) {
        const ranking = tables[index]["today"][i];
        let table = [];

        switch (tab) {
          case "points":
            stageRankings[tab + "-location"] = cleanUpStageTable(
              ranking.standings,
              {
                stageId,
                stage,
                ...sprint(ranking.label),
              },
            );
            break;

          case "kom":
            stageRankings[tab + "-location"] = cleanUpStageTable(
              ranking.standings,
              {
                stageId,
                stage,
                ...climb(ranking.label),
              },
            );
            break;
          case "youth":
            stageRankings[tab + "-day-classification"] = cleanUpStageTable(
              ranking.standings,
              { stageId, stage },
            );
            break;
          case "teams":
            stageRankings[tab + "-day-classification"] = cleanUpStageTable(
              ranking.standings,
              { stageId, stage },
            );
            break;
          default:
            console.log("Ranking:", ranking.label);

            table = cleanUpStageTable(ranking.standings, { stageId, stage });
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
 * @param {Page} page
 * @param {string} race
 * @param {number|string} year
 * @param {number|string} stage
 */
export async function srapeStageResults(page, race, year, stage) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/stage-${stage}`;
  const raceId = generateId.race(race, year);
  const stageId = generateId.stage(raceId, stage);

  try {
    await page.goto(url, { waitUntil: "networkidle2" }).catch((exception) => {
      console.error(exception.name, `Failed to Navigate to '${url}'`);
      return null;
    });

    await page
      .waitForSelector(".page-content", {
        timeout: 1200,
      })
      .catch((exception) => {
        console.error(
          exception.name,
          `Exception in scrapeStage waiting for  selector '.page-content' on '${url}'`,
        );
        return null;
      });

    const tables = await page.evaluate(() => {
      const resultConts = document.querySelectorAll(".result-cont");

      function extractTableData(tableElement) {
        const columns = Array.from(
          tableElement.querySelectorAll("thead th"),
        ).map((cell) => cell.innerText.trim());

        const rows = Array.from(tableElement.querySelectorAll("tbody tr"));
        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll("th, td"));
          const rowDeatils = {};

          for (
            let columnIndex = 0;
            columnIndex < cells.length;
            columnIndex += 1
          ) {
            const columnLabel = columns[columnIndex];
            const cell = cells[columnIndex];
            const nestedSpan = cell.querySelector("span");
            const nestedDiv = cell.querySelector("div");
            let cellContent = "";

            if (cell.classList.contains("time") && nestedSpan !== null) {
              cellContent = nestedDiv.innerText.trim();
            } else {
              cellContent = cell.innerText.trim();
            }

            rowDeatils[columnLabel] = cellContent;
          }

          return rowDeatils;
        });
      }

      const results = [];
      resultConts.forEach((resultCont, index) => {
        results[index] = {
          general: null,
          today: null,
        };

        // Tab [General]
        const general = resultCont.querySelector(".subTabs:not(.hide)");
        if (general) {
          results[index]["general"] = extractTableData(
            general.querySelector("table"),
          );
        }

        // Tab [Today]
        const today = resultCont.querySelector(".subTabs.hide");
        if (today) {
          const pairs = [];
          const headers = today.querySelectorAll("h3");
          const tables = today.querySelectorAll("table");

          for (
            let pair = 0;
            pair < headers.length && pair < tables.length;
            pair += 1
          ) {
            pairs.push({
              label: headers[pair].innerText,
              standings: extractTableData(tables[pair]),
            });
          }
          results[index]["today"] = pairs;
        }
      });

      return results;
    });

    return cleanUpStages(tables, stageId, stage);
  } catch (exception) {
    throw exception;
  }
}
