import { parseTeam } from "./teams";
import { parseRider } from "./riders";
// import { parseRace } from "./race";
// import { parseStage } from "./stage";
// import { parseRiderStageResults } from "./results";

/**
 * Process and prepare race data for visualization
 * @param {import('./raceContent.d').RawRaceContent } rawData - Raw data from API
 * @returns {import('./raceContent.d').RaceContent} Processed race data ready for D3 visualization.
 */
export function parseRaceContent(rawData) {
  // Convert objects to Maps for better data handling
  const riders = new Map(
    Object.entries(rawData.riders || {}).map(([bib, rawRider]) => [
      Number(bib),
      parseRider(rawRider),
    ]),
  );

  const teams = new Map(
    Object.entries(rawData.teams || {}).map(([teamId, rawTeam]) => [
      teamId,
      parseTeam(rawTeam),
    ]),
  );

  // Add relationships between riders and teams
  for (const rider of riders.values()) {
    const team = teams.get(rider.teamId);
    team.riders.push(rider); // Add riders to team
    rider.team = team; // link team to rider
  }

  // rawData.stages.map((rawStage) =>
  //   rawStage ? parseStage(rawStage) : null,
  // ),

  // rawData.results.map((rawRiderResults) =>
  //   rawRiderResults ? parseRiderStageResults(rawRiderResults) : null,
  // ),

  return {
    race: rawData.race,
    stages: rawData.stages,
    stagesCompleted: rawData.stagesCompleted,
    teams,
    riders,
    results: rawData.results,
  };
}
