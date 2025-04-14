import { generateId } from "../src/utils/idGenerator.js";
import { formatDate } from "../src/utils/string.js";
import { urlSections } from "../src/utils/url.js";

/**
 * @typedef {Object} RaceRecord
 * @property {string} raceId - The unique identifier for the race (raceId-year)
 * @property {string} raceName - The name of the race
 * @property {string} raceClass - The classification of the race
 * @property {string} raceUrl - The cleaned URL of the race page
 * @property {string} startDate - The start date of the race in YYYY-MM-DD format
 * @property {string} endDate - The end date of the race in YYYY-MM-DD format
 * @property {number} year - The year of the race
 */

/**
 * Creates a race ID from the race details
 * @param {string} Url - URL of the race
 * @returns {string|null} Race ID or null if couldn't be created
 */
export function extractFromUrlRaceId(Url, urlParser = urlSections) {
  const cleanUrl = Url.replace(/\/gc$/, "");
  const sections = urlParser(cleanUrl, ["_race", "raceId", "year"]);

  if (!sections) return null;
  return { raceUrlId: sections.raceId, year: sections.year };
}

/**
 * Cleans and normalizes a race record
 * @param {RaceRecord} record - The raw race record to clean
 * @param {Function} dateFormatter - Function to format dates
 * @returns {RaceRecord|null} The cleaned race record or null if invalid
 */
export function cleanRecord(record, dateFormatter = formatDate) {
  if (!record || !record.raceUrl || !record.year) return null;

  const raceUrl = record.raceUrl.replace(/\/gc$/, "");
  const { raceUrlId, year } = extractFromUrlRaceId(raceUrl);
  const raceId = generateId.race(raceUrlId, year);

  if (!raceId) return null;

  return {
    ...record,
    raceId,
    startDate: dateFormatter(record.year, record.startDate, "."),
    endDate: dateFormatter(record.year, record.endDate, "."),
    raceUrl,
    raceUrlId,
  };
}

/**
 * Scrapes race data from a cycling results page
 * @param {import('puppeteer').Page} page - The Puppeteer page object
 * @param {string} url - The URL to scrape
 * @param {number} year - The year of the races being scraped
 * @returns {Promise<RaceRecord[]|null>} Array of cleaned race records or null if an error occurs
 */
export async function scrapeRaces(page, url, year) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract data from the specified selector
    const rawData = await page.$$eval(
      ".content table tbody tr",
      (tableRows, year) => {
        return tableRows
          .map((tr) => {
            const tds = tr.querySelectorAll("td");
            if (tds.length < 5) return null;

            const dateText = tds[0].textContent.trim();
            const raceLink = tds[2].querySelector("a");
            if (!raceLink) return null;

            const raceClass = tds[4].textContent.trim();
            const [startDateText, endDateText] = dateText.split(" - ");

            const raceName = raceLink.textContent.trim();
            const raceUrl = raceLink.href;

            return {
              raceId: "",
              raceName,
              raceClass,
              raceUrl,
              raceUrlId: "",
              startDate: startDateText,
              endDate: endDateText || startDateText,
              year,
            };
          })
          .filter((record) => record !== null);
      },
      year,
    );
    console.debug("completed page.$$eval");

    // Cleanup records - eval happens within browser.
    return rawData
      .map((record) => cleanRecord(record))
      .filter((record) => record !== null);
  } catch (exception) {
    console.error(exception.error, exception.message);
    return null;
  }
}
