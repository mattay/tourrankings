import { generateId } from "../../src/utils/idGenerator.js";
import { formatDate } from "../../src/utils/string.js";
import { logError } from "../../src/utils/logging.js";

function cleanRecord(record) {
  const regexStage = /^(?<stageNumber>\d+)( \((?<stageType>.*)\))?$/;
  let stageType = null;
  let stageNumber = null;

  if (record.stage === "Prologue") {
    stageType = record.stage.toLowerCase();
    stageNumber = 0;
  } else {
    const matchStage = record.stage.match(regexStage);
    if (!matchStage) {
      console.log(record.stage);
    }
    stageNumber = matchStage?.groups.stageNumber || null;
    stageType = matchStage?.groups.stageType || null;
  }
  const raceId = generateId.race(record.raceUrlId, record.year);
  const stageId = generateId.stage(raceId, stageNumber);

  return {
    ...record,
    raceId,
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
        logError("scrapeStages page-content", exception);
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
            raceUrlId: race,
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
    logError("scrapeStages", url);
    logError("scrapeStages", exception);
    throw exception;
  }
}
