/**
 * Enum-like object containing all valid cycling classification calculation types.
 *
 * Defines how each classification is calculated and accumulated throughout a race.
 *
 * @readonly
 * @enum {string}
 * @property {string} STAGE_POSITION - Based on finish line position for individual stages
 * @property {string} ACCUMULATED_POINTS - Points collected at designated locations during/end of stages
 * @property {string} ACCUMULATED_TIME - Total time with bonifications, accumulated across stages
 * @property {string} TEAM_TIME - Sum of top 3 riders' times per team
 */
export const CALCULATION_TYPES = Object.freeze({
  STAGE_POSITION: "stage_position",
  ACCUMULATED_POINTS: "accumulated_points",
  ACCUMULATED_TIME: "accumulated_time",
  TEAM_TIME: "team_time",
});

/**
 * Enum-like object containing all valid cycling classification types.
 *
 * The keys are semantic identifiers, and the values are the string representations
 * used throughout the application for various race classifications.
 *
 * @readonly
 * @enum {string}
 * @property {string} STAGE - Stage classification.
 * @property {string} GENERAL - General classification (GC).
 * @property {string} POINTS - Points classification (sprint).
 * @property {string} MOUNTAIN - Mountain classification (climber).
 * @property {string} YOUTH - Youth classification (young rider).
 * @property {string} TEAM - Team classification.
 *
 * @example *
 * if (type === CLASSIFICATION_TYPES.POINTS) {
 *   // handle points classification
 * }
 */
export const CLASSIFICATION_TYPES = Object.freeze({
  STAGE: "stage",
  GENERAL: "general",
  POINTS: "points",
  MOUNTAIN: "mountain",
  YOUTH: "youth",
  TEAM: "team",
});

/**
 * List of available cycling classification options for UI components.
 *
 * Each option pairs a classification type (from {@link CLASSIFICATION_TYPES})
 * with a human-readable label for display purposes (e.g., in tab bars or dropdowns).
 *
 * @readonly
 * @type {Array<{type: string, label: string}>}
 *
 * @example
 * // Render classification tabs
 * CLASSIFICATION_UI_OPTIONS.forEach(option => {
 *   console.log(option.label); // e.g., "Stage"
 *   console.log(option.type);  // e.g., "stage"
 * });
 * */
export const CLASSIFICATION_UI_OPTIONS = [
  { type: CLASSIFICATION_TYPES.STAGE, label: "Stage" },
  { type: CLASSIFICATION_TYPES.GENERAL, label: "General" },
  { type: CLASSIFICATION_TYPES.POINTS, label: "Points" },
  { type: CLASSIFICATION_TYPES.MOUNTAIN, label: "Mountain" },
  { type: CLASSIFICATION_TYPES.YOUTH, label: "Youth" },
  { type: CLASSIFICATION_TYPES.TEAM, label: "Team" },
];

/**
 * Checks if a given classification type is valid.
 *
 * @param {string} type - The classification type to validate.
 * @returns {boolean} True if the type is a valid classification type, false otherwise.
 *
 * @example
 * isValidClassificationType("points"); // true
 * isValidClassificationType("foobar"); // false
 */
export function isValidClassificationType(type) {
  return Object.values(CLASSIFICATION_TYPES).includes(type);
}
