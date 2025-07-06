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
 * Checks if a string represents a valid number (including integers and floats)
 * @param {string} str - String to check
 * @returns {boolean} True if the string represents a valid number
 */
function isNumericString(str) {
  if (typeof str !== "string") return false; // Only process strings
  const num = Number(str);
  return !isNaN(num) && Number.isFinite(num);
}

/**
 * Converts an array to a Map, using the array index as key.
 * Optionally processes each value with a callback and filters out null/undefined values.
 * @template T, R
 * @param {Array<T>} arr - The array to convert
 * @param {Object} [options] - Configuration options
 * @param {(value: T, index: number) => R} [options.processValue] - Optional function to process each value
 * @param {boolean} [options.filterNulls=true] - Whether to filter out null/undefined values
 * @returns {Map<number, T|R>} A Map with indices as keys and (processed) array elements as values
 */
export function toMapFromArray(arr, options = {}) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }

  const { processValue, filterNulls = true } = options;

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
 * Numeric string keys are automatically converted to numbers for better performance.
 * @template T, R
 * @param {Record<string, T>} obj - The object to convert
 * @param {Object} [options] - Configuration options
 * @param {(value: T, key: string|number) => R} [options.processValue] - Optional function to process each value
 * @param {boolean} [options.filterNulls=false] - Whether to filter out null/undefined values
 * @param {boolean} [options.convertNumericKeys=true] - Whether to convert numeric string keys to numbers
 * @returns {Map<string|number, T|R>} A Map with object keys as keys and (processed) object values as values
 */
export function toMapFromObject(obj, options = {}) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new TypeError("Expected a plain object");
  }

  const {
    processValue,
    filterNulls = false,
    convertNumericKeys = true,
  } = options;

  const entries = Object.entries(obj).map(([key, value]) => {
    // Convert numeric string keys to numbers for better performance
    const convertedKey =
      convertNumericKeys && isNumericString(key) ? Number(key) : key;
    const processedValue = processValue
      ? processValue(value, convertedKey)
      : value;
    return tuple(convertedKey, processedValue);
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
 * @param {Object} [options] - Configuration options
 * @param {(value: T, key: string|number) => R} [options.processValue] - Optional function to process each value
 * @param {boolean} [options.filterNulls] - Whether to filter out null/undefined values (defaults: true for arrays, false for objects)
 * @param {boolean} [options.convertNumericKeys=true] - Whether to convert numeric string keys to numbers (objects only)
 * @returns {Map<any, any>|any} A Map if conversion is possible, otherwise the original value
 */
export function toMap(data, options = {}) {
  if (Array.isArray(data)) {
    return toMapFromArray(data, options);
  }

  if (typeof data === "object" && data !== null && !(data instanceof Map)) {
    return toMapFromObject(data, options);
  }

  // Return as-is for Maps, primitives, functions, etc.
  return data;
}
