import dataService from "../../src/services/dataServiceInstance.js";
import { logError, logOut } from "../../src/utils/logging.js";
import { sortByDate } from "../utils/sorts.js";

/**
 * @typedef {import('./@types/raceController.js').TemporalSeasonRaces} TemporalSeasonRaces
 * @typedef {import('./@types/raceController.js').RaceContent} RaceContent
 * @typedef {import('./@types/raceController.js').RaceResults} RaceResults
 */

/**
 * Groups season races by their temporal status relative to today.
 * @returns {TemporalSeasonRaces} An object with races grouped as current, upcoming, previous, and future.
 */
export function seasonRaces() {
  const today = new Date();
  const season = today.getFullYear();

  // Fetch races for the current season
  const races = dataService.seasonRaces(season);

  // Initialize grouped object
  const grouped /** @type TemporalSeasonRaces */ = {
    current: [],
    upcomming: [],
    previous: [],
    future: [],
  };

  // Group races by date temporal status
  races.forEach((race) => {
    const raceStart = new Date(race.startDate);
    const raceEnd = race.endDate ? new Date(race.endDate) : raceStart;

    if (today >= raceStart && today <= raceEnd) {
      grouped.current.push(race);
    } else if (raceStart > today) {
      grouped.future.push(race);
    } else if (raceEnd < today) {
      grouped.previous.push(race);
    } else {
      logOut("Options", `${today}, ${raceStart}, ${raceEnd}`);
    }
  });

  // Sort each group by start date
  Object.keys(grouped).forEach((group) => {
    const order = group === "previous" ? "desc" : "asc";
    grouped[group] = sortByDate(grouped[group], "startDate", order);
  });

  // Extract the next upcoming race (soonest in the future)
  if (grouped.future.length > 0) {
    grouped.upcomming = [grouped.future[0]];
    grouped.future = grouped.future.slice(1);
  }

  return grouped;
}

/**
 * Fetches race content for a given race ID and year.
 * @param {string} racePcsID - The race ID.
 * @param {number} year - The year of the race.
 * @returns {RaceContent} - The race content.
 */
export function raceContent(racePcsID, year = null) {
  const today = new Date();
  year = year ? year : today.getFullYear();

  logOut("raceContent", `Fetching race content for ${racePcsID} ${year}`);

  const raceContent /** @type {RaceContent} */ = {
    race: dataService.raceDetails({ racePcsID, year }),
    stages: [],
    stagesCompleted: -1,
    teams: {},
    riders: {},
    results: [],
    classifications: {
      general: [],
      youth: [],
      points: [],
      mountain: [],
      team: [],
    },
  };

  if (!raceContent.race?.raceUID) {
    logError("Race Controller", `Race not Found for ${racePcsID} ${year}`);
    return raceContent;
    // Maybe this should be null
  }

  // Stages
  const raceUID = raceContent.race.raceUID;
  // map stage number to array index
  raceContent.stages = dataService
    .raceStages(raceUID)
    .reduce((results, stage) => {
      results[stage.stage] = stage;
      return results;
    }, []);

  for (const stage of raceContent.stages) {
    if (!stage) continue;

    stage.stage = Number(stage.stage);
    stage.raced = false;
    stage.veiwing = false;
    if (new Date(stage.date) <= today) {
      stage.raced = true;
      // Looking for most recent stages to default to
      if (raceContent.stagesCompleted < stage.stage) {
        raceContent.stagesCompleted = stage.stage;
      }
    }
  }

  // Riders
  const riders = dataService.ridersInRace(raceUID);
  // Split teams and riders
  for (const rider of riders) {
    let team = raceContent.teams[rider.teamPcsId];
    if (!team) {
      const teamDets = dataService.raceTeam(rider.teamPcsId);
      team = {
        id: teamDets.teamPcsId,
        name: teamDets.teamName,
        classification: teamDets.classification,
        jerseyImage: teamDets.jerseyImagePcsUrl,
        riders: [],
      };
    }
    raceContent.teams[rider.teamPcsId] = team;
    // Clean up data for client
    raceContent.riders[rider.bib] = {
      bib: Number(rider.bib),
      rider: rider.rider,
      teamId: rider.teamPcsId,
      id: rider.riderPcsId,
      flag: rider.flag,
    };
  }

  // TODO: Add race results and classification to race RaceContent
  // We want to group the results by rider, ie the line
  // ---
  // results: [rider : stageResult[]]
  // classification: {type: rider[ stageClasifications[] ]}
  // ---
  // Results
  const rr = dataService.raceResults(raceUID);
  raceContent.results = groupStagesByRider(rr);
  // GC
  const general = dataService.raceClassificationsGeneral(raceUID);
  raceContent.classifications.general = groupStagesByRider(general);
  // Points
  const points = dataService.raceClassificationsPoints(raceUID);
  raceContent.classifications.points = groupStagesByRider(points);
  // Mountain
  const mountain = dataService.raceClassificationsMountain(raceUID);
  raceContent.classifications.mountain = groupStagesByRider(mountain);
  // Youth
  const youth = dataService.raceClassificationsYouth(raceUID);
  raceContent.classifications.youth = youth;
  // Team
  const team = dataService.raceClassificationsTeams(raceUID);
  raceContent.classifications.team = team;

  return raceContent;
}

/**
 * Regroup stage: rider results -> rider: stage results
 * @param {StagesRiderResults} raceResults
 * @returns {RidersStageResults}
 */
function groupStagesByRider(raceResults) {
  const ridersByBib = [];

  for (const stage of raceResults.values()) {
    if (!stage) continue; // Only races with a prologue start at 0

    const rowsMissingBib = [];
    for (const riderStageResult of stage) {
      if (!riderStageResult.bib) {
        rowsMissingBib.push(riderStageResult);
        continue;
      }

      const bibNumber = Number(riderStageResult.bib);
      const stageNumber = Number(riderStageResult.stage);
      if (ridersByBib[bibNumber] === undefined) {
        ridersByBib[bibNumber] = [];
      }
      ridersByBib[bibNumber][stageNumber] = riderStageResult;
    }
    if (rowsMissingBib.length > 0) {
      logError(
        "Race Controller",
        `No bib for riders, Possible relegation message`,
      );
      console.table(rowsMissingBib);
    }
  }

  return ridersByBib;
}
