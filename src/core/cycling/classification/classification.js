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
 * @example
 * import { CLASSIFICATION_TYPES } from './constants';
 *
 * if (type === CLASSIFICATION_TYPES.POINTS) {
 *   // handle points classification
 * }
 */
export const CLASSIFICATION_TYPES = {
  STAGE: "stage",
  GENERAL: "general",
  POINTS: "points",
  MOUNTAIN: "mountain",
  YOUTH: "youth",
  TEAM: "team",
};

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
