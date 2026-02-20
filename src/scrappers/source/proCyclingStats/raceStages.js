import { generateId } from "@cycling/idGenerator";
import { formatDate } from "@utils/string";
import { logError } from "@utils/logging";
import { fetchHtmlWithCache, htmlDOM } from "@scrappers/html";

/**
 * @typedef {import('./@types').ScrapedRaceStage} ScrapedRaceStage
 *
 * @typedef {Object} RawStageRecord - Raw stage record from the ProCyclingStats website.
 * @property {Number} year - The year of the race.
 * @property {String} raceUrlId - The race URL ID.
 * @property {String} date - The stage date.
 * @property {String} stage - The stage name.
 * @property {String} parcoursType - The stage parcours type.
 * @property {String} departure - The stage departure location.
 * @property {String} arrival - The stage arrival location.
 * @property {Number} distance - The stage distance.
 * @property {Number} verticalMeters - The stage vertical meters.
 * @property {String} stagePcsUrl - The cleaned URL of the stage page
 */

const DOM_SELECTORS = {
  contentTables: ".page-content table",
  stageTableColumns: "thead tr th",
  stageTableRows: "tbody tr:not(.sum)",
  stageTableCell: "td",
};

const EXPECTED_HEADERS = [
  { labeled: "Date", key: "date", type: "string" },
  { labeled: "", key: "parcoursType", type: "string" },
  { labeled: "#", key: "stage", type: "string" },
  { labeled: "Departure", key: "departure", type: "string" },
  { labeled: "Arrival", key: "arrival", type: "string" },
  { labeled: "Distance", key: "distance", type: "number" },
  { labeled: "Vertical meters", key: "verticalMeters", type: "number" },
];

const patternStage =
  /^(?:Prologue|Stage (?<stageNumber>\d+))?(?: \((?<stageType>.*)\))?$/;

/**
 * Extracts column headers from the stages table.
 * @param {Element} stagesTable - The HTML element representing the stages table.
 * @returns {string[]} An array of column headers.
 */
function columnHeader(stagesTable) {
  return Array.from(
    stagesTable.querySelectorAll(DOM_SELECTORS.stageTableColumns),
  ).map((th, index) => {
    const header = th.textContent.trim();
    const expected = EXPECTED_HEADERS[index];
    if (header !== expected.labeled) {
      logError(
        "Scrape PCS - Stages",
        `Unexpected heading [${header}] @ index [${index}]`,
      );
      return header;
    }
    return expected.key;
  });
}

/**
 * Parses the stages table and returns an array of stage details.
 * @param {string} htmlContent - The HTML element representing the stages table.
 * @param {number} year - The year of the race.
 * @returns {Object[]} An array of stage details.
 */
function parseStages(htmlContent, year) {
  const pageDOM = htmlDOM(htmlContent);

  const htmlTableStages = Array.from(
    pageDOM.querySelectorAll(DOM_SELECTORS.contentTables),
  )[0]; // We want the first table

  const columns = columnHeader(htmlTableStages);

  const rows = Array.from(
    htmlTableStages.querySelectorAll(DOM_SELECTORS.stageTableRows),
  ).map((tr, rowCount) => {
    let stageNumber = 0;
    let stageType = null;
    let matchStage;

    const cells = Array.from(tr.querySelectorAll(DOM_SELECTORS.stageTableCell));

    const stageDetails = cells.reduce((details, td, index) => {
      const key = columns[index];
      let value = td.textContent.trim();
      switch (key) {
        case "departure":
        case "arrival":
          details[key] = value;
          break;
        case "distance":
        case "verticalMeters":
          details[key] = Number(value) || null;
          break;
        case "date":
          details[key] = formatDate(year, value, "/");
          break;
        case "parcoursType":
          value = Array.from(td.querySelector("span").classList).find((cls) =>
            /^p\d+$/.test(cls),
          );
          details[key] = value;
          break;
        case "stage":
          value = td.querySelector("a").textContent.trim();
          if (value === "Prologue") {
            stageNumber = 0;
            stageType = value;
          } else {
            matchStage = value.match(patternStage);
            stageNumber = Number(matchStage?.groups.stageNumber);
            stageType = matchStage?.groups?.stageType || null;
            if (!matchStage) {
              logError(
                "Clean Record",
                `Invalid stage format: ${value} -> ${patternStage}`,
              );
            }
          }
          details[key] = stageNumber;
          details["stageType"] = stageType;
          details["stagePcsUrl"] = td.querySelector("a").href;
          break;
        default:
          console.log(index, key, td.innerHTML);
          break;
      }
      return details;
    }, {});
    return stageDetails;
  });

  return rows;
}

/**
 * Scrapes race data from HTML content (testable version)
 * @param {string} htmlContent - The HTML content to parse
 * @returns {Array<ScrapedRaceStage>} Array of cleaned race records
 */
export function scrapeRaceStagesFromHtml(htmlContent) {
  // To be implemented -> see scrapeRacesFromHtml()
  // try {
  //   const page = htmlDOM(htmlContent);
  //   const tableRows = Array.from(
  //     page.querySelectorAll(".content table tbody tr"),
  //   );
  //   const rawData = extractRawRaceData(tableRows, year);
  //   return processRaceRecords(rawData);
  // } catch (exception) {
  //   logError("Races scrapeRacesFromHtml", "Failed to parse HTML", exception);
  //   return [];
  // }
  return [];
}

/**
 * Scrapes stage data from the ProCyclingStats website.
 * @param {string} race - The race name.
 * @param {number} year - The year of the race.
 * @returns {Promise<Array<ScrapedRaceStage>>} An array of stage data.
 */
export async function scrapeRaceStages(race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/route/stages`;
  const cachePattern = `${race}-${year}-stages`;

  try {
    const htmlContent = await fetchHtmlWithCache(url, { cachePattern });
    const stages = parseStages(htmlContent.html, year);

    return stages.map((stage) => {
      const raceUID = generateId.race(race, year);
      const stageUID = generateId.stage(raceUID, stage.stage);
      return {
        ...stage,
        year,
        raceUID,
        stageUID,
      };
    });
  } catch (exception) {
    logError("Scrape PCS - Stages", url, exception);
    throw exception;
  }
}
