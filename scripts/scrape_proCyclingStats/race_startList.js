import { urlSections } from "../../src/utils/url";

/**
 * Refines a startlist by extracting team information and adding team ID.
 * @param {Array<Object>} startlist - The list of teams to refine.
 * @returns {Array<Object>} The refined startlist with extracted team information.
 */
function refineStartlist(team) {
  const regexTeam = /^(?<teamName>.*) \((?<teamClassification>.*)\)$/;

  const teamLinkSections = urlSections(team.teamLink, ["_team", "teamId"]);
  const matchTeam = team.teamName.match(regexTeam);

  if (teamLinkSections) {
    team.teamId = teamLinkSections.teamId;
  }
  if (matchTeam) {
    team.teamName = matchTeam.groups.teamName || null;
    team.teamClassification = matchTeam.groups.teamClassification || null;
  }

  team.riders = team.riders.map((rider) => {
    const riderLinkSections = urlSections(rider.riderLink, [
      "_rider",
      "riderId",
    ]);
    rider.riderId = riderLinkSections.riderId || null;
    return rider;
  });

  return team;
}

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
        const teamLink = teamNameElement ? teamNameElement.href : null;

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
          const riderLink = riderElement.querySelector("a")
            ? riderElement.querySelector("a").href
            : null;

          riders.push({ bib, flag, rider, riderLink });
        });

        teams.push({ teamName, teamLink, jerseyImageUrl, riders });
      });

      return teams;
    });

    return teams.map((team) => refineStartlist(team));
  } catch (exception) {
    throw exception;
  }
}
