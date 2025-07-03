/**
 * @typedef {Object} RawStageResult
 */
/**
 * @typedef {RawStageResult[]} RawRiderStageResults
 * RawRiderStageResults[stageNumber] = RawStageResult
 */
/**
 * @typedef {RawRiderStageResults[]} RawRaceResults
 * RawRaceResults[riderBib][stageNumber] = RawStageResult
 */

/**
 * @typedef {Object} StageResult
 */
/**
 * @typedef {StageResult[]} RiderStageResults
 * RiderStageResults[stageNumber] = StageResult
 */
/**
 * @typedef {Map<number|string, RiderStageResults>} RaceResults
 * RacerResults[riderBib][stageNumber] = StageResult
 */

export {};
