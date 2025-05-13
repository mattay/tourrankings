/**
 *
 * @param {Array<Object>} rider
 * @returns {Array<Object>} rider
 */
function cleanRiderResults(rider) {
  return rider.map((stage) => {
    const cleanedStage = {};
    for (const key of Object.keys(stage)) {
      let value = stage[key];
      switch (key) {
        case "Stage":
        case "BIB":
        case "GC":
        case "Rank":
        case "Age":
          if (value != "-" && value != "") {
            value = parseInt(value, 10);
          } else if (value == "-") {
            value = "";
          }
          break;
        default:
          break;
      }
      cleanedStage[key] = value;
    }
    return cleanedStage;
  });
}

/**
 * Process and prepare race data for visualization
 * @param {Object} rawData - Raw data from API
 * @returns {Object} Processed data ready for D3 visualization
 */
export function prepRaceData(rawData) {
  const {
    race,
    stages,
    currentStage,
    viewingStage,
    riders: ridersObj,
    teams: teamsObj,
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

  const riderResults = rawData.results.map((rider) =>
    rider ? cleanRiderResults(rider) : rider,
  );

  return {
    race,
    stages,
    currentStage,
    viewingStage,
    riders: riders,
    teams: teams,
    results: riderResults,
  };
}
