/**
 * Converts an array (possibly with nulls) to a Map, using the array index as key.
 * @param {Array<any>} arr - The array to convert.
 * @returns {Map<number, any>} A Map with indices as keys and array elements as values.
 */
export function toMapFromArray(arr) {
  return new Map(
    arr.filter((obj) => obj !== null).map((obj, index) => [index, obj]),
  );
}

/**
 * Converts a plain object to a Map.
 * @param {Object} obj - The object to convert.
 * @returns {Map<string, any>} A Map with object keys as keys and object values as values.
 */
export function toMapFromObject(obj) {
  return new Map(Object.entries(obj));
}
