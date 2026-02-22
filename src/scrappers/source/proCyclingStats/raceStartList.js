import { logError } from "@utils/logging";
import { urlSections } from "@utils/url";
import { fetchHtmlWithCache, htmlDOM } from "src/scrappers/html";
import { parseName, parseTeamName } from "./helpers";

/**
 * @typedef {import('./@types/index').ScrapedRaceStartListTeam} ScrapedRaceStartListTeam -
 *
 * @typedef {Object} RawStartListRider
 * @property {number} bib - The bib number of the rider.
 * @property {string} flag - The flag of the rider.
 * @property {string} rider - The name of the rider.
 * @property {string} riderPcsUrl - The ProcyclingStats URL of the rider.
 *
 * @typedef {Object} RawTeamStartList
 * @property {string} teamName - The name of the team.
 * @property {string} teamPcsUrl - The ProcyclingStats URL of the team.
 * @property {string} jerseyImageUrl - The name of the team.
 * @property {Array<RawStartListRider>} riders - An array of riders.
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
 * @param {HTMLElement} htmlElement - The text containing the team's title.
 * @returns {Object} The parsed team title or an error message.
 */
function parseTeamTitle(htmlElement) {
  const teamTitle = htmlElement?.textContent || null;
  const teamPcsUrl = htmlElement?.href || null;
  const linkSections = urlSections(teamPcsUrl, ["_team", "pcsId"]);
  const match = parseTeamName(teamTitle);
  if (!match.success) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse team title: ${teamTitle}`,
    );
  }

  const { teamName, teamClassification } = match.values;
  const team = {
    pcsId: linkSections?.pcsId || null,
    teamName,
    teamClassification,
  };

  return team;
}

/**
 * Parses a rider's name from a string.
 * @param {Element} htmlElement - The text containing the rider's name.
 * @returns {Object} The parsed name or an error message.
 */
function parseTeamRider(htmlElement) {
  const rider = htmlElement.querySelector("a");
  const linkSections = urlSections(rider?.href, ["_team", "pcsId"]);
  const match = parseName(rider.textContent);
  if (!match.success) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse rider name: ${rider.textContent}`,
    );
  }

  const { surname, firstNames } = match.values;
  const teamRider = {
    pcsId: linkSections?.pcsId || null,
    surname,
    firstNames,
    bib: Number(htmlElement.querySelector(".bib")?.textContent),
    flag: htmlElement.querySelector(".flag")?.className.replace("flag ", ""),
  };

  return teamRider;
}

/**
 * Parses a directeur sportif's name from a string.
 * @param {Element} htmlElement - The text containing the directeur sportif's name.
 * @returns {Object} The parsed name or an error message.
 */
function parseDirecteurSportif(htmlElement) {
  const linkSections = urlSections(htmlElement.href, ["_ds", "pcsId"]);
  const match = parseName(htmlElement.textContent);
  if (!match.success) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse directeur sportif: ${htmlElement.textContent}`,
    );
  }

  const { surname, firstNames } = match.values;
  const directeurSportif = {
    pcsId: linkSections?.pcsId || null,
    surname,
    firstNames,
  };

  return directeurSportif;
}

/**
 * Parses the startlist of a race from ProcyclingStats.
 * @param {string} htmlContent - The HTML content of the race startlist page.
 * @returns {Array<Object>} An array of teams, each with their riders.
 */
function parseStartlist(htmlContent) {
  const pageDOM = htmlDOM(htmlContent);

  return Array.from(
    pageDOM.querySelectorAll(DOM_SELECTORS.contentTeamList),
  ).map((teamElement) => {
    const team = parseTeamTitle(teamElement.querySelector(DOM_SELECTORS.team));

    const jerseyImageElement = teamElement.querySelector(DOM_SELECTORS.jersey);
    const jerseyImageUrl = jerseyImageElement ? jerseyImageElement.src : null;

    const riders = Array.from(
      teamElement.querySelectorAll(DOM_SELECTORS.teamRiders),
    ).map((rider) => parseTeamRider(rider));

    const directeurSportifs = Array.from(
      teamElement.querySelectorAll(DOM_SELECTORS.directeurSportif),
    ).map((ds) => parseDirecteurSportif(ds));

    return {
      ...team,
      jerseyImageUrl,
      riders,
      directeurSportifs,
    };
  });
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
    const startlist = parseStartlist(htmlContent.html);
    return startlist;
  } catch (exception) {
    logError("scrapeRaceStartList", `Failed to scrape ${url}`, exception);
    throw exception;
  }
}
