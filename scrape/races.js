import puppeteer from "puppeteer";
import { buildUrl } from "../utils/url.js";
import Race from "../races/races.js";

async function scrapePage(url, year) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Extract data from the specified selector
  const data = await page.$$eval(
    ".content table tbody tr",
    (tableRows, year) => {
      formatDate = (textDate) => {
        const [month, day] = textDate.split("."); // Split start date into month and day
        return `${year}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`; // Format startDate as yyyy/mm/dd
      };

      return tableRows.map((tr) => {
        const tds = tr.querySelectorAll("td");

        const dateText = tds[0].textContent.trim();
        const [startDateText, endDateText] = dateText.split(" - ");
        const raceLink = tds[2].querySelector("a");

        return {
          year,
          startDate: formatDate(startDateText),
          endDate: formatDate(endDateText),
          raceName: raceLink.textContent.trim(), // Get the race name
          raceUrl: raceLink.href.replace(/\/gc$/, ""), // Get the href attribute of the race link
          class: tds[4].textContent.trim(),
        };
      });
    },
    year,
  );

  // Close the browser
  await browser.close();
  return data;
}

async function main() {
  const filter = {
    year: 2024,
    circuit: 1,
    class: "2.UWT",
    filter: "Filter",
    p: "uci",
    s: "year-calendar",
  };
  const url = buildUrl("https://www.procyclingstats.com/races.php", filter);
  const tableRows = await scrapePage(url, filter.year);
  console.log(tableRows[0]);
  const races = new Race();
  races.update(tableRows);
}

main().catch(console.error);
