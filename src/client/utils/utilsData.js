/**
 * @typedef {import('./parse/raceContent.d').RawRaceContent } RawRaceContent
 * @typedef {import('./parse/raceContent.d').RaceContent } RaceContent
 */

import { parseRace, parseRiderStageResults, parseStage } from "./parse";

/**
 * Process and prepare race data for visualization
 * @param {RawRaceContent} rawData - Raw data from API
 * @returns {RaceContent} Processed race data ready for D3 visualization.
 */
export function prepRaceData(rawData) {
  const {
    race,
    stages,
    stagesCompleted,
    riders: ridersObj,
    teams: teamsObj,
    results,
  } = rawData;

  // Convert objects to Maps for better data handling
  let riders = new Map(Object.entries(ridersObj || {}));
  let teams = new Map(Object.entries(teamsObj || {}));

  // Add relationships between riders and teams
  for (const rider of riders.values()) {
    const team = teams.get(rider.teamId);
    team.riders.push(rider); // Add riders to team
    rider.team = team; // link team to rider
  }

  const riderResults = results.map((rider) =>
    rider ? parseRiderStageResults(rider) : rider,
  );

  return {
    race: parseRace(race),
    stages: stages.map((stage) => parseStage(stage)),
    stagesCompleted: Number(stagesCompleted),
    riders: riders,
    teams: teams,
    results: riderResults,
    // TODO: Classifications
  };
}
