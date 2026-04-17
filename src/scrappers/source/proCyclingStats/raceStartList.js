import { logError } from "@utils/logging";
import { urlSections } from "@utils/url";
import { fetchHtmlWithCache, htmlDOM } from "@scrappers/html";
import { parseName, parseTeamName } from "./helpers";

/**
 *
 * @typedef {Object} RawStartListRider
 * @property {string} pcsUrl - The ProcyclingStats URL of the rider.
 * @property {number} bib - The bib number of the rider.
 * @property {string} flag - The flag of the rider.
 * @property {string} rider - The name of the rider.
 *
 * @typedef {Object} RawTeamStartList
 * @property {string} pcsUrl - The ProcyclingStats URL of the team.
 * @property {string} name - The name of the team.
 * @property {string} jerseyImageUrl - The name of the team.
 * @property {Array<RawStartListRider>} riders - An array of riders.
 *
 * @typedef {Object} RawTeamStaff
 * @property {string} pcsUrl - The ProcyclingStats URL of the staff member.
 * @property {string} name - The name of the staff member.
 * @property {string} role - The role of the staff member.
 */

/**
 * @typedef {Object} ParsedTeamName
 * @property {string|null} pcsId - The ProcyclingStats ID of the team.
 * @property {string|null} pcsUrl - The ProcyclingStats URL of the team.
 * @property {string|null} name - The name of the team.
 * @property {string|null} classification - The classification of the team.
 *
 * @typedef {Object} ParsedRiderName
 * @property {string|null} pcsId - The ProcyclingStats ID of the rider.
 * @property {string|null} pcsUrl - The ProcyclingStats URL of the rider.
 * @property {number|null} bib - The bib number of the rider.
 * @property {string|null} surname - The surname of the rider.
 * @property {string|null} firstNames - The first names of the rider.
 * @property {string|null} flag - The flag of the rider.
 *
 * @typedef {Object} ParsedStaffName
 * @property {string|null} pcsId - The ProcyclingStats ID of the staff member.
 * @property {string|null} pcsUrl - The ProcyclingStats URL of the staff member.
 * @property {string|null} surname - The surname of the staff member.
 * @property {string|null} firstNames - The first name of the staff member.
 * @property {string|null} role - The role of the staff member.
 */

/**
 * @typedef {import('./@types/index').ScrapedRaceStartListTeam} ScrapedRaceStartListTeam
 */

const DOM_SELECTORS = {
  contentTeamList: ".page-content ul.startlist_v4 > li",
  jersey: ".shirtCont img",
  team: ".ridersCont a.team",
  teamRiders: ".ridersCont ul li",
  directeurSportif: ".dsCont a",
};

/**
 * Parses a team's title from a string.
 * @param {HTMLAnchorElement} htmlElement - The text containing the team's title.
 * @returns {ParsedTeamName} The parsed team title or an error message.
 */
function parseTeamTitle(htmlElement) {
  const title = htmlElement?.textContent || null;
  const pcsUrl = htmlElement?.href || null;
  const linkSections = urlSections(pcsUrl, ["_team", "pcsId"]);
  if (!title || !pcsUrl || !linkSections) {
    logError(
      "Scrape PCS - Start List",
      `Failed to parse team: ${htmlElement?.outerHTML}`,
    );
    return null;
  }
  const match = parseTeamName(title);
  if (!match.success) {
    logError("Scrape PCS - Start List", `Failed to parse team title: ${title}`);
  }

  const { name, classification } = match.values;
  const team = {
    pcsId: linkSections?.pcsId || null,
    name,
    classification,
    pcsUrl,
  };

  return team;
}

/**
 * Parses a rider's name from a string.
 * @param {Element} htmlElement - The text containing the rider's name.
 * @returns {ParsedRiderName} The parsed name or an error message.
 */
function parseTeamRider(htmlElement) {
  const element = /** @type {HTMLAnchorElement|null} */ (
    htmlElement.querySelector("a")
  );
  const title = element?.textContent || null;
  const pcsUrl = element?.href || null;
  const linkSections = urlSections(pcsUrl, ["_rider", "pcsId"]);
  if (!title || !pcsUrl || !linkSections) {
    logError(
      "Scrape PCS - Start List",
      `Failed to parse team rider: ${htmlElement?.outerHTML}`,
    );
    return null;
  }
  const match = parseName(title);
  if (!match.success) {
    logError("Scrape PCS - Start List", `Failed to parse rider name: ${title}`);
  }

  const { surname, firstNames } = match.values;
  const teamRider = {
    pcsId: linkSections?.pcsId || null,
    pcsUrl,
    surname,
    firstNames,
    bib: Number(htmlElement.querySelector(".bib")?.textContent) || null,
    flag:
      htmlElement
        .querySelector(".flag")
        ?.className?.replace("flag ", "")
        .trim() || null,
  };

  return teamRider;
}

/**
 * Parses a directeur sportif's name from a string.
 * @param {Element} htmlElement - The text containing the directeur sportif's name.
 * @returns {ParsedStaffName} The parsed name or an error message.
 */
function parseDirecteurSportif(htmlElement) {
  if (!htmlElement) {
    logError(
      "Scrape PCS - Start List",
      `Failed to parse directeur sportif: ${String(htmlElement)}`,
    );
    return null;
  }
  const element = /** @type {HTMLAnchorElement} */ (htmlElement);
  const title = element?.textContent || null;
  const pcsUrl = element?.href || null;
  const linkSections = urlSections(pcsUrl, ["_ds", "pcsId"]);
  if (!title || !pcsUrl || !linkSections) {
    logError(
      "Scrape PCS - Start List",
      `Failed to parse directeur sportif: ${htmlElement?.outerHTML}`,
    );
    return null;
  }
  const match = parseName(title);
  if (!match.success) {
    logError(
      "Scrape PCS - Start List",
      `Failed to parse directeur sportif: ${title}`,
    );
  }

  const { surname, firstNames } = match.values;
  const directeurSportif = {
    pcsId: linkSections?.pcsId || null,
    pcsUrl,
    surname,
    firstNames,
    role: "Directeur Sportif",
  };

  return directeurSportif;
}

/**
 * Parses the startlist of a race from ProcyclingStats.
 * @param {string} htmlContent - The HTML content of the race startlist page.
 * @param {number} year - The year of the race.
 * @returns {Array<ScrapedRaceStartListTeam>} An array of teams, each with their riders.
 */
export function extractStartlistFromHtml(htmlContent, year) {
  const pageDOM = htmlDOM(htmlContent);

  return Array.from(pageDOM.querySelectorAll(DOM_SELECTORS.contentTeamList))
    .map((teamElement) => {
      const team = parseTeamTitle(
        teamElement.querySelector(DOM_SELECTORS.team),
      ) || { pcsId: null, name: null, classification: null, pcsUrl: null };
      if (!team.name) {
        console.error("No Team");
      }

      const jerseyImageElement = /** @type {HTMLImageElement|null} */ (
        teamElement.querySelector(DOM_SELECTORS.jersey)
      );
      const jerseyImageUrl = jerseyImageElement?.src || null;
      if (!jerseyImageUrl) {
        console.error("No jerseyImageUrl");
      }

      const riders = Array.from(
        teamElement.querySelectorAll(DOM_SELECTORS.teamRiders),
      )
        .map((rider) => parseTeamRider(rider))
        .filter(Boolean)
        .map((rider) => ({ year, ...rider }));
      if (riders.length === 0) {
        console.error("No riders");
      }

      const directeurSportifs = Array.from(
        teamElement.querySelectorAll(DOM_SELECTORS.directeurSportif),
      )
        .map((ds) => parseDirecteurSportif(ds))
        .filter(Boolean)
        .map((ds) => ({ year, ...ds }));
      if (directeurSportifs.length === 0) {
        console.error("No directeurSportifs");
      }

      return {
        year,
        ...team,
        jerseyImageUrl,
        riders,
        staff: directeurSportifs,
      };
    })
    .filter((team) => team.name !== null);
}

/**
 * Scrapes race data from HTML content (testable version)
 * @param {string} htmlContent - The HTML content to parse
 * @returns {Array<ScrapedRaceStartListTeam>} Array of cleaned race records
 */
export function scrapeRaceStartListFromHtml(htmlContent) {
  // To be implemented -> see scrapeRacesFromHtml()
  return [];
}

/**
 * Scrape the startlist of a race from ProcyclingStats.
 * @async
 * @param {string} race - The race identifier (e.g., 'tour-de-france').
 * @param {number} year - The year of the race (e.g., 2024).
 * @returns {Promise<Array<ScrapedRaceStartListTeam>>} Resolves to an array of teams, each with their riders.
 * @throws {Error} Throws if navigation or scraping fails.
 *
 * @see ScrapedRaceStartListTeam
 */
export async function scrapeRaceStartList(race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/startlist`;
  const cachePattern = `${race}-${year}-startlist`;

  try {
    const htmlContent = await fetchHtmlWithCache(url, { cachePattern });
    if (
      !htmlContent ||
      typeof htmlContent.html !== "string" ||
      htmlContent.html === ""
    ) {
      logError(
        "Scrape PCS - Start List",
        "Empty or invalid HTML response",
        null,
        { url },
      );
      return [];
    }
    const startlist = extractStartlistFromHtml(htmlContent.html, year);
    return startlist;
  } catch (exception) {
    logError("Scrape PCS - Start List", `Failed to scrape ${url}`, exception);
    throw exception;
  }
}
