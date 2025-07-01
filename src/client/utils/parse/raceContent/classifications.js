import { toMapFromArray, toMapFromObject } from "src/utils/map";

/**
 * @typedef {import('./@types/classifications').RawRaceClassifications} RawRaceClassifications
 * @typedef {import('./@types/classifications').RaceClassifications} RaceClassifications
 */

/**
 * Normalizes a classification value to a Map if it's an array or object.
 * Returns the value as-is if it's neither.
 * @param {Object<string, RawRaceClassifications>|Array<RawRaceClassifications>} rawClassification - The classification data to normalize.
 * @returns {Map<any, RaceClassifications>|RaceClassifications} The normalized Map or original value.
 */
export function parseClassification(rawClassification) {
  if (Array.isArray(rawClassification)) {
    return toMapFromArray(rawClassification);
  }
  if (typeof rawClassification === "object" && rawClassification !== null) {
    return toMapFromObject(rawClassification);
  }
  // If it's neither array nor object, return as-is (or handle error)
  return rawClassification;
}
