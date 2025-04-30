import { generateId } from "../../../utils/idGenerator.js";
import { formatDate } from "../../../utils/string.js";
import { logError } from "../../../utils/logging.js";

/**
 * Cleans a record by extracting stage number and type, and generating IDs.
 * @param {RawStageRecord} record - The record to clean.
 * @returns {ScrapedRaceStage} The cleaned record.
 */
function cleanRecord(record) {
  const regexStage = /^(?<stageNumber>\d+)( \((?<stageType>.*)\))?$/;
  let stageType = null;
  let stageNumber = null;

  if (record.stage === "Prologue") {
    stageType = record.stage.toLowerCase();
    stageNumber = 0;
  } else {
    const matchStage = record.stage.match(regexStage);
    if (!matchStage) {
      console.log(record.stage);
    }
    stageNumber = matchStage?.groups.stageNumber || null;
    stageType = matchStage?.groups.stageType || null;
  }
  const raceUID = generateId.race(record.raceUrlId, record.year);
  const stageUID = generateId.stage(raceUID, stageNumber);

  return {
    ...record,
    raceUID,
    stageUID,
    date: formatDate(record.year, record.date, "/"),
    stage: stageNumber,
    stageType,
  };
}

/**
@typedef {Object} RawStageRecord - Raw stage record from the ProCyclingStats website.
 * @property {number} year - The year of the race.
 * @property {string} raceUrlId - The race URL ID.
 * @property {string} date - The stage date.
 * @property {string} stage - The stage name.
 */

/**
 * Scrapes stage data from the ProCyclingStats website.
 * @param {import('puppeteer').Page}} page - The Puppeteer page object.
 * @param {string} race - The race name.
 * @param {number} year - The year of the race.
 * @returns {Promise<Array<ScrapedRaceStage>} An array of stage data.
 */
export async function scrapeRaceStages(page, race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/route/stages`;
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    await page
      .waitForSelector(".page-content", {
        timeout: 1200,
      })
      .catch((exception) => {
        logError("scrapeStages page-content", exception);
        throw exception;
      });

    // Extract data from the specified selector
    const data = await page.$$eval(
      ".page-content table",
      (tables, race, year) => {
        const stages = Array.from(
          tables[0].querySelectorAll("tbody tr:not(.sum)"),
        );
        return stages.map((tr) => {
          const tds = tr.querySelectorAll("td");
          const dateText = tds[0].textContent.trim();

          let profileSpan = tds[1].querySelector("span");
          const parcoursType = profileSpan
            ? Array.from(profileSpan.classList).find((cls) =>
                /^p\d+$/.test(cls),
              )
            : null;

          return {
            year,
            raceUrlId: race,
            date: dateText,
            stage: tds[2].textContent.trim().replace("Stage ", ""),
            parcoursType,
            departure: tds[3].textContent.trim(),
            arrival: tds[4].textContent.trim(),
            distance: tds[5].textContent.trim(),
            verticalMeters: tds[6].textContent.trim(),
          };
        });
      },
      race,
      year,
    );

    return data.map((record) => cleanRecord(record));
  } catch (exception) {
    logError("scrapeStages", url);
    logError("scrapeStages", exception);
    throw exception;
  }
}
