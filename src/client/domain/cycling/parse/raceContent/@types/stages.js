/**
 * @typedef {object} RawStage
 * @property {string} raceUID - The unique identifier for the race (matches RaceData.raceId).
 * @property {string} stageUID - The unique identifier for the stage.
 * @property {number} year - The year of the stage.
 * @property {string} date - The date of the stage.
 * @property {number} stage - The stage number.
 * @property {string} stageType - The type of the stage.
 * @property {string} parcoursType - The type of the parcours.
 * @property {string} departure - The departure location of the stage.
 * @property {string} arrival - The arrival location of the stage.
 * @property {number} distance - The distance of the stage in kilometers.
 * @property {number} verticalMeters - The vertical meters of the stage.
 * @property {string} stagePcsUrl - The URL to the stage on procyclingstats.com.
 * @property {boolean} raced - Indicates if the stage has been raced.
 * @property {boolean} viewing - Indicates if the stage is available for viewing.
 */

/**
 * @typedef {Array<RawStage>} RawRaceStages
 * RawRaceStages[stageId] = RawStage
 * An array of RawStage, where the index is the stageId.
 */

/**
 * @typedef {object} Stage
 * @property {string} raceUID - The unique identifier for the race (matches RaceData.raceId).
 * @property {string} stageUID - The unique identifier for the stage.
 * @property {number} year - The year of the stage.
 * @property {string} date - The date of the stage.
 * @property {number} stage - The stage number.
 * @property {string} stageType - The type of the stage.
 * @property {string} parcoursType - The type of the parcours.
 * @property {string} departure - The departure location of the stage.
 * @property {string} arrival - The arrival location of the stage.
 * @property {number} distance - The distance of the stage in kilometers.
 * @property {number} verticalMeters - The vertical meters of the stage.
 * @property {string} stagePcsUrl - The URL to the stage on procyclingstats.com.
 * @property {boolean} raced - Indicates if the stage has been raced.
 * @property {boolean} viewing - Indicates if the stage is available for viewing.
 */

/**
 * @typedef {Array<Stage>} RaceStages
 * RaceStages[stageId] = Stage
 * An array of Stage, where the index is the stageId.
 */

export {};
