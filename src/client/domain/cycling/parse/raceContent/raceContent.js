import { parseRider } from "./riders";
import { toMap } from "../../../../../utils/map";

/**
 * Process and prepare race data for visualization
 * @param {import('./@types/raceContent').RawRaceContent } rawData - Raw data from API
 * @returns {import('./@types/raceContent').RaceContent} Processed race data ready for D3 visualization.
 */
export function parseRaceContent(rawData) {
  // Convert objects to Maps for better data handling
  const riders = toMap(rawData.riders, {
    processValue: parseRider,
    filterNulls: true,
    convertNumericKeys: true,
  });

  const teams = toMap(rawData.teams, {
    filterNulls: true,
  });

  // Add relationships between riders and teams
  for (const rider of riders.values()) {
    const team = teams.get(rider.teamId);
    team.riders.push(rider); // Add riders to team
    rider.team = team; // link team to rider
  }

  const results = toMap(rawData.results, {
    filterNulls: true,
    convertNumericKeys: true,
  });

  const classifications = new Map(
    Object.entries(rawData.classifications || {}).map(
      ([classification, rawClassification]) => [
        classification,
        toMap(rawClassification, {
          filterNulls: true,
          convertNumericKeys: true,
        }),
      ],
    ),
  );

  return {
    race: rawData.race,
    stages: rawData.stages,
    stagesCompleted: rawData.stagesCompleted,
    teams,
    riders,
    results,
    classifications,
  };
}
