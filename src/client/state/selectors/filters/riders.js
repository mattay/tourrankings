/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('./../@types/riders').FilteredStageRider} FilteredStageRider
 */

function sortAbandoned(a, b) {
  const compared = b.lastStage - a.lastStage;
  if (compared == 0) {
    return a.bib - b.bib;
  }
  return compared;
}

/**
 *
 * @param {State} state -
 * @returns {Array<FilteredStageRider>}
 */
export function riders(state) {
  if (!state.raceData || !state.currentStage) return null;

  const ridersWithStageRanking = [];
  const abandoned = [];

  for (const rider of state.raceData.riders.values()) {
    if (!rider) continue;
    const bib = rider.bib;
    const riderResults = state.raceData.results[bib];
    const riderStageResult = riderResults[state.currentStage];
    let lastStage = state.currentStage;
    let lastRank = riderStageResult?.rank || NaN;

    let newRider = {
      ...rider,
      abandoned: false,
      lastStage,
      stageRankings: {
        result: lastRank,
      },
    };

    if (isNaN(lastRank)) {
      console.warn("Rider may have abandoned the race", rider.bib, rider.rider);
      for (let i = riderResults.length - 1; i >= 0; i--) {
        if (!riderResults[i]) continue;
        // Find last stage resutls where ranking is not a number
        if (isNaN(riderResults[i].rank)) {
          lastStage = riderResults[i].stage;
          abandoned.push({
            ...newRider,
            lastStage,
            abandoned: true,
          });
          break;
        }
      }
    } else {
      ridersWithStageRanking.push(newRider);
    }
  }

  for (const rider of abandoned.sort(sortAbandoned)) {
    ridersWithStageRanking.push({
      ...rider,
      stageRankings: {
        // result is last in list
        result: ridersWithStageRanking.length + 1,
      },
    });
  }

  return ridersWithStageRanking;
}
