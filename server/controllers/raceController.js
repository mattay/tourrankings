import dataService from "../../src/services/dataServiceInstance.js";
import { logOut } from "../../src/utils/logging.js";
import { sortByDate } from "../utils/sorts.js";

/**
 * @typedef {import("../../src/services/dataServiceInstance").RaceData} RaceData
 * @typedef {import("../../src/services/dataServiceInstance").RaceStageData} RaceStageData
 */

/** @typedef {Object} TemporalSeasonRaces
 * @property {import("../../src/services/dataServiceInstance").RaceData[]} current - Races currently ongoing.
 * @property {import("../../src/services/dataServiceInstance").RaceData[]} upcoming - Races yet to start.
 * @property {import("../../src/services/dataServiceInstance").RaceData[]} previous - Races already completed.
 * @property {import("../../src/services/dataServiceInstance").RaceData[]} future - Races scheduled for the future.
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
  const grouped = {
    current: [],
    upcoming: [],
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
    grouped.upcoming = [grouped.future[0]];
    grouped.future = grouped.future.slice(1);
  }

  return grouped;
}

/**
 * @typedef {Object} RaceContent
 * @property {RaceData} race - The race details.
 * @property {RaceStageData[]} stages - The race stages.
 * @property {RaceStageData} lastCompletedStage - The last completed stage.
 * @property {RaceStageData} viewingStage - The stage being viewed.
 */

/**
 * Fetches race content for a given race ID and year.
 * @param {string} racePcsID - The race ID.
 * @param {number} year - The year of the race.
 * @returns {RaceContent} - The race content.
 */
export function raceContent(racePcsID, year = null) {
  // logOut("raceContent", `${racePcsID} ${year}`, "debug");

  const today = new Date();
  year = year ? year : today.getFullYear();

  logOut("raceContent", `Fetching race content for ${racePcsID} ${year}`);

  /** @type {RaceContent} */
  const raceContent = {
    race: dataService.raceDetails({ racePcsID, year }),
    stages: [],
    lastCompletedStage: null,
    viewingStage: null,
    teams: {},
    riders: {},
  };
  // console.debug("RaceContent", raceContent);

  if (raceContent.race?.raceUID) {
    const raceUID = raceContent.race.raceUID;

    raceContent.stages = dataService.raceStages(raceUID);
    raceContent.lastCompletedStage = raceContent.stages.find(
      (el) => el !== undefined,
    );
    raceContent.viewingStage = raceContent.stages.find(
      (el) => el !== undefined,
    );

    /** @type {RaceStageData} */
    for (const stage of raceContent.stages) {
      // Looking for most recent stages to default to
      stage.stage = Number(stage.stage);
      stage.verticalMeters = Number(stage.verticalMeters);
      if (new Date(stage.date) <= today) {
        raceContent.lastCompletedStage = stage;
        raceContent.viewingStage = stage;
      }
    }

    const riders = dataService.ridersInRace(raceUID);

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
  }

  return raceContent;
}
