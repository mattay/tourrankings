/**
 * Creates a tuple from two values.
 * @template K, V
 * @param {K} k - The key value
 * @param {V} v - The value
 * @returns {[K, V]} A tuple containing the key and value
 */
export function tuple(k, v) {
  return [k, v];
}

/**
 * Converts an array to a Map, using the array index as key.
 * Optionally processes each value with a callback and filters out null/undefined values.
 * @template T, R
 * @param {Array<T>} arr - The array to convert
 * @param {(value: T, index: number) => R} [processValue] - Optional function to process each value
 * @param {boolean} [filterNulls=true] - Whether to filter out null/undefined values
 * @returns {Map<number, T|R>} A Map with indices as keys and (processed) array elements as values
 */
export function toMapFromArray(arr, processValue, filterNulls = true) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }

  const entries = arr.map((item, index) => {
    const value = processValue ? processValue(item, index) : item;
    return tuple(index, value);
  });

  return new Map(
    filterNulls ? entries.filter(([, value]) => value != null) : entries,
  );
}

/**
 * Converts a plain object to a Map.
 * Optionally processes each value with a callback and filters out null/undefined values.
 * @template T, R
 * @param {Record<string, T>} obj - The object to convert
 * @param {(value: T, key: string) => R} [processValue] - Optional function to process each value
 * @param {boolean} [filterNulls=false] - Whether to filter out null/undefined values
 * @returns {Map<string, T|R>} A Map with object keys as keys and (processed) object values as values
 */
export function toMapFromObject(obj, processValue, filterNulls = false) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new TypeError("Expected a plain object");
  }

  const entries = Object.entries(obj).map(([key, value]) => {
    const processedValue = processValue ? processValue(value, key) : value;
    return tuple(key, processedValue);
  });

  return new Map(
    filterNulls ? entries.filter(([, value]) => value != null) : entries,
  );
}

/**
 * Converts an array or plain object to a Map.
 * Optionally processes each value with a callback.
 * If the input is already a Map, or not an array/object, it is returned as-is.
 * @template T, R
 * @param {Array<T>|Record<string, T>|Map<any, any>|any} data - The data to convert
 * @param {(value: T, key: string|number) => R} [processValue] - Optional function to process each value
 * @param {boolean} [filterNulls] - Whether to filter out null/undefined values (defaults: true for arrays, false for objects)
 * @returns {Map<any, any>|any} A Map if conversion is possible, otherwise the original value
 */
export function toMap(data, processValue, filterNulls) {
  if (Array.isArray(data)) {
    return toMapFromArray(data, processValue, filterNulls);
  }

  if (typeof data === "object" && data !== null && !(data instanceof Map)) {
    return toMapFromObject(data, processValue, filterNulls);
  }

  // Return as-is for Maps, primitives, functions, etc.
  return data;
}
