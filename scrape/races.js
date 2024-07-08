import { urlSections } from "../utils/url.js";
import { formatDate } from "../utils/string.js";

function cleanRecord(year, record) {
  const raceUrl = record.raceUrl.replace(/\/gc$/, "")
  const linkSections = urlSections(raceUrl, ["_race", "raceId", "year"]);
  const raceId = linkSections.raceId + "-" + linkSections.year;

  return {
    ...record,
    raceId,
    year,
    startDate: formatDate(year, record.startDate, "."),
    endDate: formatDate(year, record.endDate, "."),
    raceUrl
  };
}

export async function scrapeRaces(page, url, year) {
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract data from the specified selector
    const data = await page.$$eval(".content table tbody tr", (tableRows) => {
      return tableRows.map((tr) => {
        const tds = tr.querySelectorAll("td");

        const dateText = tds[0].textContent.trim();
        const raceLink = tds[2].querySelector("a");
        const raceClass = tds[4].textContent.trim();
        const [startDateText, endDateText] = dateText.split(" - ");
        const raceName = raceLink.textContent.trim();
        const raceUrl = raceLink.href;

        return {
          raceName,
          class: raceClass,
          startDate: startDateText,
          endDate: endDateText,
          raceUrl,
        };
      });
    });

    // Cleanup records - eval happens within browser.
    return data.map((record) => cleanRecord(year, record));
  } catch (exception) {
    console.error(exception.error, exception.message);
    return null;
  }
}
