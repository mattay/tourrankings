import {
  CALCULATION_TYPES,
  getClassificationsByCalculationType,
} from "@cycling/classification/classification";
import { stringToSeconds } from "@utils/time";

/**
 * @typedef {import('@client/domain/cycling/parse/raceContent/@types/raceContent.js').RaceContent} RaceContent
 */

/**
 * Returns the last element of an array.
 * @template T
 * @param {Array<T>} riderStages - Array of items.
 * @returns {T | null} Last item, or null if not an array.
 */
function ridersLastStage(riderStages) {
  if (!Array.isArray(riderStages) || riderStages.length === 0) {
    return null;
  }
  return riderStages[riderStages.length - 1];
}

/**
 * Converts a Map's values to an array.
 * @template T
 * @param {Map<*, T>} map - Source map.
 * @returns {Array<T>}
 */
function valuesToArray(map) {
  return Array.from(map.values());
}

/**
 * Gets the last-stage rider results for a classification.
 * @param {RaceContent} dataStruct - Race data structure.
 * @param {string} classification - Classification key.
 * @returns {Array<*>}
 */
function classificationRiderLastStage(dataStruct, classification) {
  const classificationMap = dataStruct.classifications.get(classification);
  if (!classificationMap) {
    return [];
  }

  return Array.from(classificationMap.values()).map(ridersLastStage);
}

/**
 * Returns the maximum string length of a given field across a dataset.
 * Missing values, null, undefined, or missing property are treated as length 0.
 *
 * @param {Array<Record<string, unknown>>} data - Array of objects.
 * @param {string} field - Property name to measure.
 * @returns {number} Maximum label length, or 0 if no valid values.
 */
export function getMaxLabelLength(data, field) {
  if (!Array.isArray(data) || typeof field !== "string") {
    return 0;
  }

  return data.reduce((max, item) => {
    const value = item?.[field];
    if (value == null) {
      return max;
    }
    return Math.max(max, String(value).length);
  }, 0);
}

/**
 * Calculates the number of characters needed to display the largest numeric value.
 * Non-numeric, null, undefined, and missing values are ignored.
 *
 * @param {Array<Record<string, unknown>>} data - Array of objects.
 * @param {string} field - Field name containing numeric values.
 * @returns {number} Character length of the maximum value, or 0 if no valid numbers.
 */
function getMaxValue(data, field) {
  if (!Array.isArray(data) || typeof field !== "string") {
    return 0;
  }

  let max = -Infinity;

  for (const item of data) {
    const value = item?.[field];
    if (typeof value === "number" && Number.isFinite(value)) {
      max = Math.max(max, value);
    }
  }

  return max === -Infinity ? 0 : max;
}

/**
 * Calculates the number of characters needed to display the largest numeric value.
 * Non-numeric, null, undefined, and missing values are ignored.
 *
 * @param {Array<Record<string, unknown>>} data - Array of objects.
 * @param {string} field - Field name containing numeric values.
 * @returns {number} Character length of the maximum value, or 0 if no valid numbers.
 */
function getMaxTimeSeconds(data, field) {
  if (!Array.isArray(data) || typeof field !== "string") {
    return 0;
  }

  let max = -Infinity;

  for (const item of data) {
    const value = item?.[field];
    if (typeof value !== "string" || !value.includes(":")) {
      continue;
    }

    const seconds = stringToSeconds(value);
    if (Number.isFinite(seconds)) {
      max = Math.max(max, seconds);
    }
  }

  return max === -Infinity ? 0 : max;
}

/**
 *
 * @param {RaceContent} dataStruct
 * @returns
 */
export function getMax(dataStruct) {
  const teams = valuesToArray(dataStruct.teams);
  const riders = valuesToArray(dataStruct.riders);
  const results = valuesToArray(dataStruct.results);

  const teamsNameMaxLength = getMaxLabelLength(teams, "name");
  const riderNameMaxLength = getMaxLabelLength(riders, "rider");

  const maxPoints = getClassificationsByCalculationType(
    CALCULATION_TYPES.ACCUMULATED_POINTS,
  ).map((classification) =>
    getMaxValue(
      classificationRiderLastStage(dataStruct, classification),
      "points",
    ),
  );

  const maxTime = getClassificationsByCalculationType(
    CALCULATION_TYPES.ACCUMULATED_TIME,
  ).map((classification) =>
    getMaxTimeSeconds(
      classificationRiderLastStage(dataStruct, classification),
      "time",
    ),
  );

  // Collect each riders last stage results
  const maxRank = results.map(ridersLastStage);

  const label = Math.max(teamsNameMaxLength, riderNameMaxLength);
  const bib = getMaxValue(riders, "bib");
  const rank = maxRank.length; // Assume total riders == max ranking
  const time = Math.max(...maxTime);
  const points = Math.max(...maxPoints);
  return {
    maxSize: { label },
    maxValue: {
      bib,
      rank,
      time, // formatSeconds
      points,
    },
  };
}
