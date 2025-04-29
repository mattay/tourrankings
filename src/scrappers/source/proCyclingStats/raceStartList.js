import { logError } from "../../../utils/logging";
import { urlSections } from "../../../utils/url";

/** @typedef {Object} RawStartListRider
 * @property {number} bib - The bib number of the rider.
 * @property {string} flag - The flag of the rider.
 * @property {string} rider - The name of the rider.
 * @property {string} riderPcsUrl - The ProcyclingStats URL of the rider.
 */

/** @typedef {Object} RawTeamStartList
 * @property {string} teamName - The name of the team.
 * @property {string} teamPcsUrl - The ProcyclingStats URL of the team.
 * @property {string} jerseyImageUrl - The name of the team.
 * @property {Array<RawStartListRider>} riders - An array of riders.
 */

/**
 * Refines a startlist by extracting team information and adding team ID.
 * @param {Array<RawTeamStartList>} startlist - The list of teams to refine.
 * @returns {Array<ScrapedRaceStartListTeam>} The refined startlist with extracted team information.
 *
 * @see ScrapedRaceStartListTeam
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

/**
 * Scrape the startlist of a race from ProcyclingStats.
 * @async
 * @param {import('puppeteer').Page} page - The Puppeteer page instance used for navigation and DOM extraction.
 * @param {string} race - The race identifier (e.g., 'tour-de-france').
 * @param {number} year - The year of the race (e.g., 2024).
 * @returns {Promise<Array<ScrapedRaceStartListTeam>} Resolves to an array of teams, each with their riders.
 * @throws {Error} Throws if navigation or scraping fails.
 *
 * @see ScrapedRaceStartListTeam
 */
export async function scrapeRaceStartList(page, race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/startlist`;
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    const teams = await page.evaluate(() => {
      const teams = [];
      const teamElements = document.querySelectorAll(
        ".page-content ul.startlist_v4 > li",
      );

      teamElements.forEach((teamElement) => {
        // Capture html content
        const teamNameElement = teamElement.querySelector(
          ".ridersCont > div > a.team",
        );
        const teamName = teamNameElement ? teamNameElement.innerText : null;
        const teamPcsUrl = teamNameElement ? teamNameElement.href : null;

        const jerseyImageElement = teamElement.querySelector(".shirtCont img");
        const jerseyImageUrl = jerseyImageElement
          ? jerseyImageElement.src
          : null;

        const riderElements = teamElement.querySelectorAll(".ridersCont ul li");
        const riders = [];

        riderElements.forEach((riderElement) => {
          const bib = riderElement.querySelector(".bib")
            ? riderElement.querySelector(".bib").innerText
            : null;
          const flag = riderElement.querySelector(".flag")
            ? riderElement.querySelector(".flag").className.replace("flag ", "")
            : null;
          const rider = riderElement.querySelector("a")
            ? riderElement.querySelector("a").innerText
            : null;
          const riderPcsUrl = riderElement.querySelector("a")
            ? riderElement.querySelector("a").href
            : null;

          riders.push({ bib, rider, flag, riderPcsUrl });
        });

        teams.push({ teamName, teamPcsUrl, jerseyImageUrl, riders });
      });

      return teams;
    });

    return teams.map((team) => refineStartlist(team));
  } catch (exception) {
    logError("scrapeRaceStartList - url", url);
    throw exception;
  }
}
