import { isTeamClassification } from "src/core/cycling/classification/classification";
import { stateCheckSelected } from "../../store/stateCheck";
import {
  isCompetingIn,
  selectedClassificationsRankings,
} from "./utils/classifications";

/**
 * @typedef {import('../../store/@types/store').State} State
 * @typedef {import('../@types/result').FilteredStageResult} FilteredStageResult
 * @typedef {import('../@types/classifications').FilteredClassifications} FilteredClassifications
 */

/**
 * Configuration object for handling team vs rider data
 * @typedef {Object} DataConfig
 * @property {Map} source - Data source (teams or riders)
 * @property {string} idKey - Key for unique identifier
 * @property {string} labelKey - Key for display name
 * @property {string} sourceKey - Key for lookups
 */

/**
 * Gets configuration for accessing team or rider data
 * @param {string} classification - Selected classification type
 * @param {Object} sportData - Sport data containing teams and riders
 * @returns {DataConfig} Configuration object for data access
 */
function getDataConfig(classification, sportData) {
  const isTeam = isTeamClassification(classification);

  return {
    source: isTeam ? sportData.teams : sportData.riders,
    idKey: isTeam ? "id" : "bib",
    labelKey: isTeam ? "name" : "rider",
    sourceKey: isTeam ? "name" : "bib",
  };
}

/**
 * Creates a ranking label for a participant at the current stage
 * @param {Object} participant - Participant data (team or rider)
 * @param {DataConfig} config - Data access configuration
 * @param {number} selectedStage - Currently selected stage
 * @param {Array} classifications - Classification data for this participant
 * @returns {RankingLabel} Ranking label object
 */
function createCurrentStageLabel(
  participant,
  config,
  selectedStage,
  classifications,
) {
  const stageResult = classifications?.[selectedStage] || {};

  return {
    id: participant[config.idKey],
    label: participant[config.labelKey],
    hasAbandoned: false,
    lastStage: selectedStage,
    ranking: stageResult?.rank || NaN,
  };
}

/**
 * @typedef {Object} RankingLabel
 * @property {string|number} id - Unique identifier (team ID or rider bib)
 * @property {string} label - Display name (team name or rider name)
 * @property {boolean} hasAbandoned - Whether participant abandoned the race
 * @property {number} lastStage - Last stage completed
 * @property {number} ranking - Current ranking position
 */

/**
 * Finds the last valid stage result for an abandoned participant
 * @param {Array} classifications - Classification data for participant
 * @param {RankingLabel} baseLabel - Base label to update
 * @returns {RankingLabel|null} Updated label with last stage info, or null if no valid stage found
 */
function findLastValidStage(classifications, baseLabel) {
  for (let stage = classifications.length - 1; stage >= 0; stage--) {
    const stageResult = classifications[stage];
    if (!stageResult?.rank || isNaN(stageResult.rank)) continue;

    return {
      ...baseLabel,
      lastStage: stageResult.stage,
      ranking: stageResult.rank,
      hasAbandoned: true,
    };
  }

  return null; // No valid stage result found
}

/**
 * Sorts abandoned participants by last stage completed, then by identifier
 * @param {RankingLabel} a - First participant to compare
 * @param {RankingLabel} b - Second participant to compare
 * @returns {number} Comparison result for sorting
 */
function sortAbandoned(a, b) {
  const stageComparison = b.lastStage - a.lastStage;
  return stageComparison !== 0 ? stageComparison : a.ranking - b.ranking;
}

/**
 * Processes a single participant and adds them to appropriate list
 * @param {Object} participant - Participant data
 * @param {DataConfig} config - Data access configuration
 * @param {number} selectedStage - Currently selected stage
 * @param {Map} classificationsRankings - All classification rankings
 * @param {RankingLabel[]} activeList - List for active participants
 * @param {RankingLabel[]} abandonedList - List for abandoned participants
 */
function processParticipant(
  participant,
  config,
  selectedStage,
  classificationsRankings,
  activeList,
  abandonedList,
) {
  const participantKey = participant[config.sourceKey];
  const classifications = classificationsRankings.get(participantKey);

  // Skip if not competing in this classification
  if (!isCompetingIn(classifications)) {
    return;
  }

  const label = createCurrentStageLabel(
    participant,
    config,
    selectedStage,
    classifications,
  );

  if (isNaN(label.ranking)) {
    // Participant may have abandoned - find their last valid stage
    const lastValidLabel = findLastValidStage(classifications, label);
    if (lastValidLabel) {
      abandonedList.push(lastValidLabel);
    }
  } else {
    // Participant is active at current stage
    activeList.push(label);
  }
}

/**
 * @param {State} state
 * @returns {Object[]}
 */
export const rankingLabels = (state) => {
  if (!state.sportData) {
    return null;
  }

  stateCheckSelected(state, { stage: true, classification: true });
  const { stage: selectedStage, classification: selectedClassification } =
    state.selected;

  const config = getDataConfig(selectedClassification, state.sportData);
  const classificationsRankings = selectedClassificationsRankings(state);

  const activeParticipants = [];
  const abandonedParticipants = [];

  // Process each participant (team or rider)
  for (const [, participant] of config.source) {
    if (!participant) continue;

    processParticipant(
      participant,
      config,
      selectedStage,
      classificationsRankings,
      activeParticipants,
      abandonedParticipants,
    );
  }

  // Combine active and abandoned participants
  const sortedAbandoned = abandonedParticipants
    .sort(sortAbandoned)
    .map((participant, index) => ({
      ...participant,
      ranking: activeParticipants.length + index + 1,
    }));

  const finalList = [...activeParticipants, ...sortedAbandoned];

  return finalList;
};
