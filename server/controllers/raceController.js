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

  const raceContent /** @type {RaceContent} */ = {
    race: dataService.raceDetails({ racePcsID, year }),
    stages: [],
    stagesCompleted: -1,
    teams: {},
    riders: {},
    results: [],
    classifications: {
      general: [],
      points: [],
      mountain: [],
      youth: [],
      team: {},
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
  raceContent.classifications.youth = groupStagesByRider(youth);
  // Team
  const team = dataService.raceClassificationsTeams(raceUID);
  raceContent.classifications.team = groupStagesByTeam(team);

  return raceContent;
}

/**
 * Generic function to regroup stage-based results by a specified entity key
 * @param {Iterable<Array<Object>>} raceResults - Iterable of arrays of stage results
 * @param {string} keyProperty - Property name to group by (e.g., 'bib', 'team')
 * @param {string} entityType - Type of entity for error logging (e.g., 'riders', 'teams')
 * @returns {Object<string|number, Array<Object>>} - Object mapping entity keys to arrays of stage results
 */
function groupStagesByEntity(raceResults, keyProperty, entityType) {
  const entitiesByKey = keyProperty === "bib" ? [] : {};

  for (const stage of raceResults.values()) {
    if (!stage) continue; // Only races with a prologue start at 0

    const rowsMissingKey = [];
    for (const entityStageResult of stage) {
      const keyValue = entityStageResult[keyProperty];

      if (!keyValue) {
        rowsMissingKey.push(entityStageResult);
        continue;
      }

      const processedKey = keyProperty === "bib" ? Number(keyValue) : keyValue;
      const stageNumber = Number(entityStageResult.stage);

      // Initialize if not present
      if (keyProperty === "bib") {
        if (entitiesByKey[processedKey] === undefined) {
          entitiesByKey[processedKey] = [];
        }
      } else {
        entitiesByKey[processedKey] ??= [];
      }

      entitiesByKey[processedKey][stageNumber] = entityStageResult;
    }

    if (rowsMissingKey.length > 0) {
      logError(
        "Race Controller",
        `No ${keyProperty} for ${entityType}, Possible relegation message`,
      );
      console.table(rowsMissingKey);
    }
  }

  return entitiesByKey;
}

/**
 * Regroup stage: rider results -> rider: stage results
 * @param {Iterable<Array<Object>>} raceResults - Iterable of arrays of rider stage results
 * @returns {Array<Array<Object>>} - Array mapping rider bib numbers to arrays of stage results
 */
function groupStagesByRider(raceResults) {
  return groupStagesByEntity(raceResults, "bib", "riders");
}

/**
 * Regroups stage: team results -> team: stage results
 * @param {Iterable<Array<Object>>} raceResults - Iterable of arrays of team stage results
 * @returns {Object<string, Array<Object>>} - Object mapping team names to arrays of stage results
 */
function groupStagesByTeam(raceResults) {
  return groupStagesByEntity(raceResults, "team", "teams");
}
