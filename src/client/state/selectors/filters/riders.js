import {
  isValidClassificationType,
  CLASSIFICATION_TYPES,
} from "src/core/cycling/classification/classification";
import {
  riderCompetingIn,
  selectedClassifications,
} from "./utils/classifications";

/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('./../@types/rider').FilteredStageRider} FilteredStageRider
 */

/**
 * Sorts abandoned riders by last stage completed, then by bib number
 * @param {FilteredStageRider} a - First rider to compare
 * @param {FilteredStageRider} b - Second rider to compare
 * @returns {number} Comparison result for sorting
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
    state.selected.stage === null ||
    !isValidClassificationType(state.selected.classification)
  ) {
    return null;
  }

  const ridersWithStageRanking = [];
  const abandoned = [];
  const classificationsRankings = selectedClassifications(state);

  // Rider bib number is used to index the rider in the Array
  for (const [bib, rider] of state.raceData.riders) {
    if (!rider) continue;

    const riderClassifications = classificationsRankings[bib];

    // Check if rider is competing in the current classification
    if (!riderCompetingIn(riderClassifications)) {
      continue;
    }

    let riderStageStanding = riderClassifications?.[state.selected.stage] || {};
    let lastStage = state.selected.stage;
    let lastRank = riderStageStanding?.rank || NaN;
    let newRider = {
      ...rider,
      hasAbandoned: false,
      lastStage,
      stageRankings: {
        result: lastRank,
      },
    };

    if (
      !riderClassifications &&
      state.selected.classification === CLASSIFICATION_TYPES.STAGE
    ) {
      console.warn(
        `No classifications found for rider ${bib} ${rider.rider}.`,
        "Rider may have abandoned the race",
      );
      newRider.hasAbandoned = true;
    } else if (!riderClassifications) {
      continue;
    }

    if (newRider.hasAbandoned) {
      abandoned.push(newRider);
      continue;
    }

    if (isNaN(lastRank)) {
      // Work back from the last classification to find the last stage result
      for (let stage = riderClassifications.length - 1; stage >= 0; stage--) {
        riderStageStanding = riderClassifications[stage];
        if (!riderStageStanding) continue;

        lastRank = riderStageStanding.rank;
        lastStage = riderStageStanding.stage;
        newRider.stageRankings.result = lastRank;
        // Find last stage results where ranking is not a number
        if (isNaN(lastRank)) {
          console.warn(
            "Rider may have abandoned the race",
            rider.bib,
            rider.rider,
          );
          newRider.lastStage = lastStage;
          newRider.hasAbandoned = true;
          abandoned.push(newRider);
          break;
        } else if (lastRank) {
          break;
        }
      }
      // Catch the last stage if we don't have results yet
      if (!newRider.hasAbandoned) {
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
