import { Page } from "puppeteer-core";
import { generateId } from "../../../utils/idGenerator.js";
import { formatDate } from "../../../utils/string.js";
import { logError } from "../../../utils/logging.js";

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

/**
 * Cleans a record by extracting stage number and type, and generating IDs.
 * @param {RawStageRecord} record - The record to clean.
 * @returns {ScrapedRaceStage} The cleaned record.
 */
function cleanRecord(record) {
  const regexStage = /^(?<stageNumber>\d+)( \((?<stageType>.*)\))?$/;
  let stageType = null;
  let stageNumber = 0;

  if (record.stage === "Prologue") {
    stageType = record.stage.toLowerCase();
  } else {
    const matchStage = record.stage.match(regexStage);
    if (!matchStage) {
      console.log(record.stage);
    }
    stageNumber = Number(matchStage?.groups.stageNumber) || null;
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
 * Scrapes stage data from the ProCyclingStats website.
 * @param {Page} page - The Puppeteer page object.
 * @param {string} race - The race name.
 * @param {number} year - The year of the race.
 * @returns {Promise<Array<ScrapedRaceStage>} An array of stage data.
 */
export async function scrapeRaceStages(page, race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/route/stages`;
  try {
    await page.goto(url, { waitUntil: "networkidle2" }).catch((exception) => {
      logError("scrapeStages", "Navigation failed");
      logError("scrapeStages", exception.name);
      logError("scrapeStages", exception.message);
    });

    await page
      .waitForSelector(".page-content", {
        timeout: 1200,
      })
      .catch((exception) => {
        logError("scrapeStages", "page-content", exception);
        throw exception;
      });

    // Extract data from the specified selector
    const data = await page.$$eval(
      ".page-content table",
      (tables, race, year, url) => {
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
            stagePcsUrl: url,
          };
        });
      },
      race,
      year,
      url,
    );

    return data.map((record) => cleanRecord(record));
  } catch (exception) {
    logError("scrapeStages", url, exception);
    throw exception;
  }
}
