import { generateId } from "../utils/idGenerator.js";
import { formatDate } from "../utils/string.js";

function cleanRecord(record) {
  const regexStage = /^(?<stageNumber>\d+)( \((?<stageType>.*)\))?$/;
  const matchStage = record.stage.match(regexStage);
  const stageNumber = matchStage.groups.stageNumber;
  const stageType = matchStage.groups.stageType;
  const stageId = generateId.stage(record.raceId, stageNumber);

  return {
    ...record,
    raceId: generateId.race(record.raceId, record.year),
    date: formatDate(record.year, record.date, "/"),
    stageId,
    stage: stageNumber,
    stageType,
  };
}

export async function scrapeStages(page, race, year) {
  const url = `https://www.procyclingstats.com/race/${race}/${year}/route/stages`;
  try {
    await page.goto(url, { waitUntil: "networkidle2" });

    await page
      .waitForSelector(".page-content", {
        timeout: 1200,
      })
      .catch((exception) => {
        console.error("Exception in scrapeStages page-content");
        console.log(exception.name, exception.message);
        throw exception;
      });

    // Extract data from the specified selector
    const data = await page.$$eval(
      ".page-content table",
      (tables, race, year) => {
        const stages = Array.from(
          tables[0].querySelectorAll("tbody tr:not(.sum)"),
        );
        return stages.map((tr) => {
          const tds = tr.querySelectorAll("td");
          const dateText = tds[0].textContent.trim();

          let profileSpan = tds[1].querySelector("span");
          const parcoursType = profileSpan
            ? Array.from(profileSpan.classList).find((cls) =>
                /^p\d+$/.test(cls),
              )
            : null;

          return {
            year,
            raceId: race,
            date: dateText,
            stage: tds[2].textContent.trim().replace("Stage ", ""),
            parcoursType,
            departure: tds[3].textContent.trim(),
            arrival: tds[4].textContent.trim(),
            distance: tds[5].textContent.trim(),
            verticalMeters: tds[6].textContent.trim(),
          };
        });
      },
      race,
      year,
    );

    return data.map((record) => cleanRecord(record));
  } catch (exception) {
    console.error("URL", url);
    console.error(exception);
    throw exception;
  }
}
