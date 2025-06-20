import {
  isValidClassificationType,
  CLASSIFICATION_TYPES,
} from "src/core/cycling/classification/classification";

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
  if (
    !state.raceData ||
    state.currentStage == null ||
    !isValidClassificationType(state.currentClassification)
  ) {
    return null;
  }

  const ridersWithStageRanking = [];
  const abandoned = [];
  let classificationsRankings = [];

  if (state.currentClassification === CLASSIFICATION_TYPES.STAGE) {
    classificationsRankings = state.raceData.results;
  } else if (
    Object.hasOwn(state.raceData.classifications, state.currentClassification)
  ) {
    classificationsRankings =
      state.raceData.classifications[state.currentClassification];
  } else {
    console.warn(
      `Unhandled classification type in selector: ${state.currentClassification}`,
    );
  }

  // Rider bib number is user to index the rider in the Array
  for (const [bib, rider] of state.raceData.riders) {
    if (!rider) continue;

    const riderClassifications = classificationsRankings[bib];
    const riderStageStanding = riderClassifications?.[state.currentStage] || {};
    let lastStage = state.currentStage;
    let lastRank = riderStageStanding?.rank || NaN;
    let hasAbandoned = false;

    let newRider = {
      ...rider,
      hasAbandoned,
      lastStage,
      stageRankings: {
        result: lastRank,
      },
    };

    if (newRider.hasAbandoned) {
      abandoned.push(newRider);
      continue;
    }

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
