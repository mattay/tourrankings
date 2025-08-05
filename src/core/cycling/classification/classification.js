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
 * Configuration object mapping each classification type to its calculation method and properties.
 *
 * @readonly
 * @type {Object<string, {label: string, calculationType: string, description: string, teamBased: boolean, ageRestriction?: number}>}
 */
export const CLASSIFICATION_CONFIG = Object.freeze({
  [CLASSIFICATION_TYPES.STAGE]: {
    label: "Stage",
    calculationType: CALCULATION_TYPES.STAGE_POSITION,
    description: "Position at finish line for individual stage completion",
    teamBased: false,
  },
  [CLASSIFICATION_TYPES.GENERAL]: {
    label: "General",
    calculationType: CALCULATION_TYPES.ACCUMULATED_TIME,
    description:
      "Total stage completion time minus bonifications, accumulated across all stages",
    teamBased: false,
  },
  [CLASSIFICATION_TYPES.POINTS]: {
    label: "Points",
    calculationType: CALCULATION_TYPES.ACCUMULATED_POINTS,
    description:
      "Points collected at designated locations during and/or at end of stages",
    teamBased: false,
  },
  [CLASSIFICATION_TYPES.MOUNTAIN]: {
    label: "Mountain",
    calculationType: CALCULATION_TYPES.ACCUMULATED_POINTS,
    description:
      "Points collected at mountain/climb locations, may include bonifications for time-based classifications",
    teamBased: false,
  },
  [CLASSIFICATION_TYPES.YOUTH]: {
    label: "Youth",
    calculationType: CALCULATION_TYPES.ACCUMULATED_TIME,
    description:
      "Same as General Classification but restricted to riders under 25 years old",
    teamBased: false,
    ageRestriction: 25,
  },
  [CLASSIFICATION_TYPES.TEAM]: {
    label: "Team",
    calculationType: CALCULATION_TYPES.TEAM_TIME,
    description: "Sum of top 3 riders' accumulated times per team",
    teamBased: true,
  },
});

/**
 * List of available cycling classification options for UI components.
 * Generated from CLASSIFICATION_CONFIG to ensure consistency.
 *
 * Each option pairs a classification type with its human-readable label
 * for display purposes (e.g., in tab bars or dropdowns).
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
 */
export const CLASSIFICATION_UI_OPTIONS = Object.entries(
  CLASSIFICATION_CONFIG,
).map(([type, config]) => ({
  type,
  label: config.label,
}));

/**
 * Checks if a given classification type is valid.
 *
 * @param {string} classificationType - The classification type to validate.
 * @returns {boolean} True if the type is a valid classification type, false otherwise.
 *
 * @example
 * isValidClassificationType("points"); // true
 * isValidClassificationType("foobar"); // false
 */
export function isValidClassificationType(classificationType) {
  if (typeof classificationType !== "string") {
    return false;
  }
  return Object.values(CLASSIFICATION_TYPES).includes(classificationType);
}

/**
 * Gets the calculation type for a given classification.
 *
 * @param {string} classificationType - The classification type to get calculation info for.
 * @returns {string|null} The calculation type, or null if classification type is invalid.
 *
 * @example
 * getCalculationType("points"); // "accumulated_points"
 * getCalculationType("general"); // "accumulated_time"
 */
export function getCalculationType(classificationType) {
  if (typeof classificationType !== "string") {
    return null;
  }
  const config = CLASSIFICATION_CONFIG[classificationType];
  return config ? config.calculationType : null;
}

/**
 * Gets the full configuration for a given classification type.
 *
 * @param {string} classificationType - The classification type to get config for.
 * @returns {Object|null} The classification configuration object, or null if invalid.
 *
 * @example
 * getClassificationConfig("youth");
 * // Returns: {
 * //   calculationType: "accumulated_time",
 * //   description: "Same as General Classification but restricted to riders under 25 years old",
 * //   teamBased: false
 * //   ageRestriction: 25,
 * // }
 */
export function getClassificationConfig(classificationType) {
  if (typeof classificationType !== "string") {
    return null;
  }
  return CLASSIFICATION_CONFIG[classificationType] || null;
}

/**
 * Checks if a classification is team-based.
 *
 * @param {string} classificationType - The classification type to check.
 * @returns {boolean} True if the classification is team-based, false otherwise.
 *
 * @example
 * isTeamClassification("team"); // true
 * isTeamClassification("general"); // false
 */
export function isTeamClassification(classificationType) {
  if (typeof classificationType !== "string") {
    return false;
  }
  const config = CLASSIFICATION_CONFIG[classificationType];
  return config ? config.teamBased : false;
}

/**
 * Gets classifications that use a specific calculation type.
 *
 * @param {string} calculationType - The calculation type to filter by.
 * @returns {string[]} Array of classification types that use the specified calculation method.
 *
 * @example
 * getClassificationsByCalculationType("accumulated_points"); // ["points", "mountain"]
 * getClassificationsByCalculationType("accumulated_time"); // ["general", "youth"]
 */
export function getClassificationsByCalculationType(calculationType) {
  if (typeof calculationType !== "string") {
    return [];
  }
  return Object.entries(CLASSIFICATION_CONFIG)
    .filter(([_, config]) => config.calculationType === calculationType)
    .map(([classificationType, _]) => classificationType);
}

/**
 * Validates a classification parameter.
 * @param {any} classification - The classification value to validate.
 * @param {string} fallbackClassification - The fallback classification to use if the input is invalid.
 * @returns {string|null} - Returns the valid classification string, or null if invalid.
 */
export function validateClassification(
  classification,
  fallbackClassification = CLASSIFICATION_TYPES.GENERAL,
) {
  if (classification === undefined || classification === null) {
    return fallbackClassification;
  }

  if (!isValidClassificationType(classification)) {
    console.warn(`Classification type "${classification}" is not valid.`);
    return fallbackClassification;
  }

  return classification;
}
