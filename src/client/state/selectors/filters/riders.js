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
    const riderStageResult = riderResults[state.currentStage] || {};
    let lastStage = state.currentStage;
    let lastRank = riderStageResult?.rank || NaN;
    let isAbandoned = false;

    let newRider = {
      ...rider,
      abandoned: isAbandoned,
      lastStage,
      stageRankings: {
        result: lastRank,
      },
    };

    if (isNaN(lastRank)) {
      for (let i = riderResults.length - 1; i >= 0; i--) {
        if (!riderResults[i]) continue;
        lastRank = riderResults[i].rank;
        lastStage = riderResults[i].stage;
        newRider.stageRankings.result = lastRank;
        // Find last stage resutls where ranking is not a number
        if (isNaN(lastRank)) {
          console.warn(
            "Rider may have abandoned the race",
            rider.bib,
            rider.rider,
          );
          isAbandoned = true;
          newRider.lastStage = lastStage;
          newRider.abandoned = isAbandoned;
          abandoned.push(newRider);
          break;
        } else if (lastRank) {
          break;
        }
      }
      // Catch the last stage if we don't have results yet
      if (!isAbandoned) {
        ridersWithStageRanking.push(newRider);
      }
      // We need a way to indicate that we don't have results
      // ? Do we hold the previous rankings
    } else {
      ridersWithStageRanking.push(newRider);
    }
  }

  // Order and places abandoned riders at the end of the list.
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
