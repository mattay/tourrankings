import { htmlDOM } from "../../domParser";
import { fetchHtmlWithPuppeteer } from "../../fetch";
import { generateId } from "../../../utils/idGenerator";
import { logError, logOut } from "../../../utils/logging";
import { formatDate } from "../../../utils/string";
import { buildUrl, urlSections } from "../../../utils/url";

/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 * @typedef {import('../../../models/races/races').Races} Races
 */

/**
 * @typedef {Object} RaceRecord - Race record from ProCyclingStats
 * @property {string} raceUID - The unique identifier of the race
 * @property {number} year - The year of the race
 * @property {string} startDate - The start date of the race
 * @property {string} endDate - The end date of the race
 * @property {string} raceClass - The class of the race
 * @property {string} raceName - The name of the race
 * @property {string} racePcsUrl - The URL of the race on ProCyclingStats
 * @property {string} racePcsID - The ID of the race on ProCyclingStats
 */

/**
 * Collects World Tour races for a given year
 * @param {Page} page - The Puppeteer page object
 * @param {Races} races - The Races collection to update
 * @param {number} year - The year of the races to collect
 */
export async function collectWorldTourRaces(page, races, year) {
  const filter = {
    year: year,
    circuit: 1,
    class: "2.UWT",
    filter: "Filter",
    p: "uci",
    s: "year-calendar",
  };
  const url = buildUrl("https://www.procyclingstats.com/races.php", filter);

  const tableRows = await scrapeRaces(page, url, filter.year);
  if (!tableRows || tableRows.length == 0) {
    logError("Collect World Tour Races", url);
    logError("Collect World Tour Races", `No races found for year ${year}`);
    return;
  }
  try {
    for (const row of tableRows) {
      logOut(
        "Collect World Tour Races",
        `${row.raceClass}\t${row.startDate} - ${row.endDate}\t${row.raceName}`,
      );
    }
    await races.update(tableRows);
  } catch (error) {
    logError("Collect World Tour Races", "Failed to update races", error);
  }
}

/**
 * Extracts the race ID and year from a race URL.
 *
 * This function cleans up the given race URL (removes `/gc` suffix if present),
 * then parses it with a URL section extractor (by default {@link urlSections}).
 * It looks specifically for sections labeled as `"_race"`, `"racePcsID"`, and `"year"`.
 *
 * @param {string} url - The full race URL to parse.
 * @param {(urlString: string, sectionLabels: string[]) => Record<string, string>|null} [urlParser=urlSections] -
 *   A parser function (like {@link urlSections}) that maps parts of the pathname
 *   to provided labels. Defaults to {@link urlSections}.
 *
 * @returns {{ racePcsID: string, year: number } | null}
 *   An object containing the extracted `racePcsID` and `year` if successful,
 *   or `null` if parsing fails or required parts are missing.
 *
 * @example
 * // Given a URL such as:
 * const url = "https://www.procyclingstats.com/race/tour-down-under/2024/gc";
 * const raceInfo = extractFromUrlRaceId(url);
 * // raceInfo => { racePcsID: "tour-down-under", year: "2024" }
 */
function extractFromUrlRaceId(url, urlParser = urlSections) {
  const cleanUrl = url.replace(/\/gc$/, "");
  const sections = urlParser(cleanUrl, ["_race", "racePcsID", "year"]);

  if (!sections || !sections.racePcsID || !sections.year) return null;
  return { racePcsID: String(sections.racePcsID), year: Number(sections.year) };
}

/**
 * Extracts raw race data from table row elements
 * @param {Array<Element>} tableRows - Array of table row elements
 * @param {number} year - The year of the races
 * @returns {Array<RaceRecord>} Array of raw race records
 */
export function extractRawRaceData(tableRows, year) {
  return tableRows
    .map((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 5) return null;

      const dateText = tds[0].textContent?.trim();
      const raceLink = tds[2].querySelector("a");

      if (!dateText || !raceLink) return null;

      const raceClass = tds[4].textContent?.trim();
      const [startDateText, endDateText] = dateText.split(/\s*[-–—]\s*/);

      const raceName = raceLink.textContent?.trim();
      const racePcsUrl = raceLink.href;

      // Validate required fields
      if (!startDateText || !raceClass || !raceName || !racePcsUrl) return null;

      return {
        raceUID: "",
        year,
        startDate: startDateText,
        endDate: endDateText || startDateText,
        raceClass,
        raceName,
        racePcsUrl,
        racePcsID: "",
      };
    })
    .filter((record) => record !== null);
}

/**
 * Cleans and normalizes a race record
 * @param {RaceRecord} record - The raw race record to clean
 * @param {Function} dateFormatter - Function to format dates
 * @param {Function} urlParser - Function to parse URL sections
 * @param {Function} idGenerator - Function to generate race IDs
 * @returns {RaceRecord|null} The cleaned race record or null if invalid
 */
function cleanRaceRecord(
  record,
  dateFormatter = formatDate,
  urlParser = extractFromUrlRaceId,
  idGenerator = generateId.race,
) {
  if (!record) {
    logError("Races cleanRaceRecord", "Record empty", null, record);
    return null;
  }

  if (!record.racePcsUrl || !record.year) {
    logError(
      "Races cleanRaceRecord",
      `Missing required fields: racePcsUrl, year`,
      null,
      record,
    );
    return null;
  }

  const racePcsUrl = record.racePcsUrl.replace(/\/gc$/, "");
  const parsed = urlParser(racePcsUrl);
  if (!parsed || !parsed.racePcsID || !parsed.year) {
    logError(
      "Races cleanRaceRecord",
      `Failed to parse race URL: ${racePcsUrl} -> racePcsID:'${parsed?.racePcsID}' year:'${parsed?.year}'`,
      null,
      record,
    );
    return null;
  }
  const { racePcsID, year: yearFromUrl } = parsed;
  const raceUID = idGenerator(racePcsID, Number(record.year ?? yearFromUrl));

  if (!raceUID) {
    logError(
      "Races cleanRaceRecord",
      `Failed to generate race UID from racePcsID:'${racePcsID}' year:'${yearFromUrl}'`,
      null,
      record,
    );
    return null;
  }

  return {
    ...record,
    raceUID,
    startDate: dateFormatter(record.year, record.startDate, "."),
    endDate: dateFormatter(record.year, record.endDate, "."),
    racePcsID,
    racePcsUrl,
  };
}

/**
 * Scrapes race data from HTML content (testable version)
 * @param {string} htmlContent - The HTML content to parse
 * @param {number} year - The year of the races being scraped
 * @returns {Array<RaceRecord>} Array of cleaned race records
 */
export function scrapeRacesFromHtml(htmlContent, year) {
  try {
    const page = htmlDOM(htmlContent);
    const tableRows = Array.from(
      page.querySelectorAll(".content table tbody tr"),
    );
    const rawData = extractRawRaceData(tableRows, year);
    return processRaceRecords(rawData);
  } catch (exception) {
    logError("Races scrapeRacesFromHtml", "Failed to parse HTML", exception);
    return [];
  }
}

/**
 * Processes an array of raw race records and returns cleaned records
 * @param {Array<RaceRecord>} rawRecords - Array of raw race records
 * @param {Function} dateFormatter - Function to format dates
 * @param {Function} urlParser - Function to parse URL sections
 * @param {Function} idGenerator - Function to generate race IDs
 * @returns {Array<RaceRecord>} Array of cleaned race records
 */
function processRaceRecords(
  rawRecords,
  dateFormatter = formatDate,
  urlParser = extractFromUrlRaceId,
  idGenerator = generateId.race,
) {
  if (!rawRecords || rawRecords.length === 0) return [];
  return rawRecords
    .map((record) =>
      cleanRaceRecord(record, dateFormatter, urlParser, idGenerator),
    )
    .filter((record) => record !== null);
}

/**
 * Scrapes race data from a cycling results page
 * @param {Page} page - The Puppeteer page object
 * @param {string} url - The URL to scrape
 * @param {number} year - The year of the races being scraped
 * @returns {Promise<Array<RaceRecord>|null>} Array of cleaned race records or null if an error occurs
 */
export async function scrapeRaces(page, url, year) {
  try {
    const htmlContent = await fetchHtmlWithPuppeteer(page, url);
    return scrapeRacesFromHtml(htmlContent, year);
  } catch (exception) {
    logError("Races scrapeRaces", url, exception);

    return null;
  }
}
