export const YEAR_MIN = 1900;

// https://stackoverflow.com/a/3552493/5250085
/**
 * Formats parts of a date according to multiple Intl.DateTimeFormat options,
 * then combines them with a separator.
 *
 * @param {Date} date - The Date object to format.
 * @param {Intl.DateTimeFormatOptions[]} options - An array of DateTimeFormat options.
 *   Each option object is applied separately, and the resulting strings are combined.
 * @param {string} separator - The character(s) used to join the formatted parts.
 * @returns {string} The formatted date string.
 *
 * @example
 * const date = new Date("2025-09-01T10:42:00Z");
 * const options = [{ year: "numeric" }, { month: "2-digit" }, { day: "2-digit" }];
 * const result = dateTimeFormatter(date, options, "-");
 * // result -> "2025-09-01"
 */
function dateTimeFormatter(date, options, separator = "-") {
  function format(/** @type {Intl.DateTimeFormatOptions} */ option) {
    let formatter = new Intl.DateTimeFormat("en", option);
    return formatter.format(date);
  }
  return options.map(format).join(separator);
}

/**
 * Produces an ISO-like datetime string (YYYY-MM-DD HH:mm:ss.SSS) in 24-hour time.
 * Note: No offset/Z suffix is included even when a timeZone is supplied.
 *       Consider appending the numeric offset or 'Z' if disambiguation is required.
 *
 * @param {Date} date - The Date object to format.
 * @param {string} [timeZone] - The time zone to use for formatting.
 * @returns {string} A formatted string containing the date and time with millisecond precision.
 *
 * @example
 * const date = new Date("2025-09-01T10:42:00.123Z");
 * const result = isoDateTime(date);
 * // -> "2025-09-01 20:42:00.123"  (depends on local timezone if timeZone is omitted)
 * const resultUTC = isoDateTime(date, "UTC");
 * // -> "2025-09-01 10:42:00.123"
 */
export function isoDateTime(date, timeZone) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError("isoDateTime: invalid Date");
  }
  const maybeTZ = timeZone ? { timeZone } : {};
  /** @type {Intl.DateTimeFormatOptions[]} */
  const dayOptions = [
    { year: "numeric", ...maybeTZ },
    { month: "2-digit", ...maybeTZ },
    { day: "2-digit", ...maybeTZ },
  ];
  /** @type {Intl.DateTimeFormatOptions} */
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    fractionalSecondDigits: 3,
    numberingSystem: "latn",
    ...maybeTZ,
  };

  const day = dateTimeFormatter(date, dayOptions, "-");
  let rawTime;
  try {
    rawTime = new Intl.DateTimeFormat("en", timeOptions).format(date);
  } catch (e) {
    if (timeZone && e instanceof RangeError) {
      throw new RangeError(`isoDateTime: invalid timeZone "${timeZone}"`, {
        cause: e,
      });
    }
    throw e;
  }
  const ms = String(date.getMilliseconds()).padStart(3, "0");
  const time = rawTime.includes(".") ? rawTime : `${rawTime}.${ms}`;

  return `${day} ${time}`;
}

/**
 * Validates and normalizes a year value.
 *
 * If the provided value is missing, not an integer, or falls outside the range
 * [YEAR_MIN, current year + 5] (computed at call time),
 * the fallback year is used instead.
 *
 * @param {any} yearParam - The year value to validate.
 * @param {number} [fallbackYear=new Date().getFullYear()] -
 *   The year to use if the input is invalid. Defaults to the current year.
 * @returns {number} The validated year.
 *
 * @example
 * validateYear("2024");        // -> 2024
 * validateYear("");            // -> current year
 * validateYear("notayear");    // -> current year
 * validateYear("1800", 2000);  // -> 2000
 * validateYear(String(YEAR_MIN)); // -> YEAR_MIN
 * const DYNAMIC_MAX = new Date().getFullYear() + 5;
 * validateYear(String(DYNAMIC_MAX + 1), DYNAMIC_MAX); // -> DYNAMIC_MAX
 */
export function validateYear(
  yearParam,
  fallbackYear = new Date().getFullYear(),
) {
  const currentYear = new Date().getFullYear();
  const dynamicMax = currentYear + 5; // compute at call time
  // normalize + clamp fallback into [YEAR_MIN, dynamicMax]
  let safeFallback = Number.isInteger(fallbackYear)
    ? fallbackYear
    : currentYear;
  if (safeFallback < YEAR_MIN) safeFallback = YEAR_MIN;
  if (safeFallback > dynamicMax) safeFallback = dynamicMax;

  if (
    yearParam === undefined ||
    yearParam === null ||
    String(yearParam).trim() === ""
  ) {
    return safeFallback; // Allow missing year
  }
  const year = Number(yearParam);
  if (Number.isInteger(year) && year >= YEAR_MIN && year <= dynamicMax) {
    return year;
  }
  return safeFallback;
}
