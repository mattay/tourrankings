import { logError } from "@utils/logging";
import { urlSections } from "@utils/url";
import { fetchHtmlWithCache, htmlDOM } from "src/scrappers/html";

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

const PATTERN_TEAM = /^(?<teamName>.*) \((?<teamClassification>.*)\)$/;
const PATTERN_NAME = /^(?<surname>[\p{Lu} '’-]+)\s+(?<firstNames>.+)$/u;

/**
 * Refines a startlist by extracting team information and adding team ID.
 * @param {RawTeamStartList} team - The team to refine.
 * @returns {ScrapedRaceStartListTeam} The refined startlist with extracted team information.
 */
function refineStartlist(team) {
  const regexTeam = /^(?<teamName>.*) \((?<teamClassification>.*)\)$/;

  const teamLinkSections = urlSections(team.teamPcsUrl, ["_team", "teamPcsId"]);
  const matchTeam = team.teamName.match(regexTeam);

  if (teamLinkSections) {
    team.teamPcsId = teamLinkSections.teamPcsId;
  }
  if (matchTeam) {
    team.teamName = matchTeam.groups.teamName || null;
    team.teamClassification = matchTeam.groups.teamClassification || null;
  }

  team.riders = team.riders.map((rider) => {
    const riderLinkSections = urlSections(rider.riderPcsUrl, [
      "_rider",
      "riderPcsId",
    ]);
    rider.riderPcsId = riderLinkSections.riderPcsId || null;
    return rider;
  });

  return team;
}

/** */
function parseTeamTitle(htmlElement) {
  const teamName = htmlElement?.textContent || null;
  const teamPcsUrl = htmlElement?.href || null;
  const teamLinkSections = urlSections(teamPcsUrl, ["_team", "teamPcsId"]);
  const matchTeam = teamName.match(PATTERN_TEAM);
  if (!matchTeam) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse team title: ${teamName}`,
    );
  }

  const team = {
    teamName: matchTeam?.groups?.teamName || null,
    teamClassification: matchTeam?.groups?.teamClassification || null,
    teamPcsId: teamLinkSections?.teamPcsId || null,
  };

  return team;
}

/** */
function parseTeamRider(htmlElement) {
  const rider = htmlElement.querySelector("a");
  const matchName = rider.textContent.match(PATTERN_NAME);
  if (!matchName) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse rider name: ${htmlElement.textContent}`,
    );
  }

  const teamRider = {
    bib: Number(htmlElement.querySelector(".bib")?.textContent),
    flag: htmlElement.querySelector(".flag")?.className.replace("flag ", ""),
    // surname: matchName?.groups?.surname,
    // firstNames: matchName?.groups?.firstNames,
    ...matchName.groups,
    riderPcsUrl: rider?.href,
  };

  return teamRider;
}

/** */
function parseDirecteurSportif(htmlElement) {
  const dsLinkSections = urlSections(htmlElement.href, ["_ds", "dsPcsId"]);
  const matchDs = htmlElement.textContent.match(PATTERN_NAME);
  if (!matchDs) {
    logError(
      "Scrape PSC - Start List",
      `Failed to parse directeur sportif: ${htmlElement.textContent}`,
    );
  }

  const directeurSportif = {
    ...matchDs.groups,
    // dsLastNames: ...matchDs?.groups?.dsLastNames || null,
    // dsNames: matchDs?.groups?.dsNames || null,
    dsPcsId: dsLinkSections?.dsPcsId || null,
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
