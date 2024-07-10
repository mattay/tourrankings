import { Page } from "puppeteer";

function cleanUpStage(stageId, results) {
  return results
    .sort((a, b) => {
      return parseInt(a.Rnk) - parseInt(b.Rnk);
    })
    .map((item) => {
      // ▼▲
      if (item.hasOwnProperty("▼▲")) {
        item["Change"] = item["▼▲"];
        delete item["▼▲"];

        let value = item["Change"];
        if (value.startsWith("▲")) {
          item["Change"] = value.slice(1);
        } else if (value.startsWith("▼")) {
          item["Change"] = -value.slice(1);
        }
      }

      // This key breaks console.table
      if (item.hasOwnProperty("")) {
        item["Bonis"] = item[""];
        delete item[""];
      }
      // Not needed.
      if (item.hasOwnProperty("H2H")) {
        delete item["H2H"];
      }
      // Strip team from rider
      if (item.hasOwnProperty("Rider") && item.hasOwnProperty("Team")) {
        item["Rider"] = item["Rider"].replace(item["Team"], "").trim();
      }

      for (let key of Object.keys(item)) {
        const value = item[key];
        switch (key) {
          case "Rnk":
          case "Prev":
          case "GC":
          case "BIB":
          case "Age":
          case "Points":
          case "Today":
          case "Change":
            if (value != "-" && value != "") {
              item[key] = parseInt(value, 10);
            } else if (value == "-") {
              item[key] = "";
            }
            break;
          default:
            break;
        }
      }

      return { ...item, stageId };
    });
}

function cleanUpGC(stageId, results) {
  return cleanUpStage(stageId, results);
}

/**
 * @param {Page} page
 * @param {string} race
 * @param {number|string} year
 * @param {number|string} stage
 */
export async function srapeStage(page, race, year, stage) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/stage-${stage}`;
  const stageId = `${race}-${stage}`;
  const topN = 10;

  try {
    const stage = {};
    console.log(url);
    await page.goto(url, { waitUntil: "networkidle2" });
    console.log("Navigated");

    // const cookies = await page.cookies();
    // console.log("cookies", cookies);
    await page
      .waitForSelector(".page-content", {
        timeout: 1200,
      })
      .catch((exception) => {
        console.error(`Exception in scrapeStage page-content for ${url}`);
        console.log(exception.name, exception.message);
        throw exception;
      });
    console.log("Contnent Ready");

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
        const general = resultCont.querySelector(".subTabs:not(.hide)");
        // const today = resultCont.querySelector(".subTabs.hide)");

        if (general) {
          results[index]["general"] = extractTableData(
            general.querySelector("table"),
          );
        }

        // // const subTabs = resultCont.querySelectorAll(".subTabs table");
        // const resultsContents = [];
        // subTabs.forEach((tableSelector) => {
        //   const tableContents = extractTableData(tableSelector);
        //   resultsContents.push(tableContents);
        // });
        // results.push(resultsContents);
      });

      return results;
    });

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

      switch (tab) {
        // case "points":
        default:
          console.log(index, tab, Object.keys(tables[index]));
          break;
      }

      if (tab && tables[index].hasOwnProperty("general")) {
        const general = cleanUpStage(stageId, tables[index]["general"]);
        stage[tab] = general;
      } else {
        console.error(tab, index, Object.keys(tables[index]));
      }
      // DNF=Did not finish / DNS=Did not start / OTL = Outside time limit / DF=Did finish, no result / NR=No result
    }
    console.table(stage["stage"].splice(0, topN));
    console.table(stage["gc"].splice(0, topN));
    console.table(stage["points"].splice(0, topN));
    console.table(stage["kom"].splice(0, topN));
    console.table(stage["youth"].splice(0, topN));
    console.table(stage["teams"].splice(0, topN));

    return stage;
  } catch (exception) {
    console.error("URL", url);
    console.error(exception.name, exception.message);
    throw exception;
  }
}
