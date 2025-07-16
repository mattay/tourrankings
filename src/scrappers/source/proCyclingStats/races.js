import { generateId } from "../../../utils/idGenerator";
import { logError, logOut } from "../../../utils/logging";
import { formatDate } from "../../../utils/string";
import { buildUrl, urlSections } from "../../../utils/url";

/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 * @typedef {import('../../../models/races/races').Races} Races
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
 * Creates a race ID from the race details
 * @param {string} Url - URL of the race
 * @returns {string|null} Race ID or null if couldn't be created
 */
function extractFromUrlRaceId(Url, urlParser = urlSections) {
  const cleanUrl = Url.replace(/\/gc$/, "");
  const sections = urlParser(cleanUrl, ["_race", "racePcsID", "year"]);

  if (!sections) return null;
  return { racePcsID: sections.racePcsID, year: sections.year };
}

/**
 * Cleans and normalizes a race record
 * @param {ScrapedRace} record - The raw race record to clean
 * @param {Function} dateFormatter - Function to format dates
 * @returns {ScrapedRace|null} The cleaned race record or null if invalid
 */
function cleanRecord(record, dateFormatter = formatDate) {
  if (!record || !record.racePcsUrl || !record.year) return null;

  const racePcsUrl = record.racePcsUrl.replace(/\/gc$/, "");
  const { racePcsID, year } = extractFromUrlRaceId(racePcsUrl);
  const raceUID = generateId.race(racePcsID, year);

  if (!raceUID) return null;

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
 * Scrapes race data from a cycling results page
 * @param {Page} page - The Puppeteer page object
 * @param {string} url - The URL to scrape
 * @param {number} year - The year of the races being scraped
 * @returns {Promise<Array<ScrapedRace>|null>} Array of cleaned race records or null if an error occurs
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
            const racePcsUrl = raceLink.href;

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
      },
      year,
    );

    // Cleanup records - eval happens within browser.
    return rawData
      .map((record) => cleanRecord(record))
      .filter((record) => record !== null);
  } catch (exception) {
    logError("Races cleanRecord", url, exception);

    return null;
  }
}
