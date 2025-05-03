import { fetchRaceData } from "./api.js";

/**
 * Prepares race data for display.
 * @param {string} raceID - The ID of the race.
 * @param {number} year - The year of the race.
 * @returns {Promise<Object>} - The prepared race data.
 */
export async function prepRaceData(raceID, year) {
  // Fetch race data
  const data = await fetchRaceData(raceID, year);

  // Store the data
  let raceData = data?.race || null;
  let stageData = data?.stages || null;
  let currentStage = data?.viewingStage || null;
  let riders = new Map(Object.entries(data?.riders));
  let teams = new Map(Object.entries(data?.teams));

  // Add relationships between riders and teams
  for (const rider of riders.values()) {
    const team = teams.get(rider.teamId);
    team.riders.push(rider); // Add riders to team
    rider.team = team; // link team to rider
  }

  return {
    race: raceData,
    stages: stageData,
    viewingStage: currentStage,
    riders: riders,
    teams: teams,
  };
}
