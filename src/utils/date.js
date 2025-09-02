// https://stackoverflow.com/a/3552493/5250085
/**
 * Formats parts of a date according to multiple Intl.DateTimeFormat options,
 * then combines them with a separator.
 *
 * @param {Date} date - The Date object to format.
 * @param {Array<Intl.DateTimeFormatOptions>} options - An array of DateTimeFormat options.
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
function dateTimeFormatter(date, options, separator) {
  function format(option) {
    let formatter = new Intl.DateTimeFormat("en", option);
    return formatter.format(date);
  }
  return options.map(format).join(separator);
}

/**
 * Produces an ISO-like datetime string (YYYY-MM-DD HH:mm:ss.SSS) in 24-hour time.
 *
 * @param {Date} date - The Date object to format.
 * @returns {string} A formatted string containing the date and time with millisecond precision.
 *
 * @example
 * const date = new Date("2025-09-01T10:42:00.123Z");
 * const result = isoDateTime(date);
 * // -> "2025-09-01 20:42:00.123"  (depending on local timezone)
 */
export function isoDateTime(date) {
  const dayOptions = [
    { year: "numeric" },
    { month: "2-digit" },
    { day: "2-digit" },
  ];
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    fractionalSecondDigits: 3,
  };

  const day = dateTimeFormatter(date, dayOptions, "-");
  const time = new Intl.DateTimeFormat("en-AU", timeOptions).format(date);

  return `${day} ${time}`;
}

/**
 * Validates and normalizes a year value.
 *
 * If the provided value is missing, not an integer, or falls outside the range [1900, 2100],
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
 */
export function validateYear(
  yearParam,
  fallbackYear = new Date().getFullYear(),
) {
  const currentYear = new Date().getFullYear();
  const safeFallback =
    Number.isInteger(fallbackYear) &&
    fallbackYear >= 1900 &&
    fallbackYear <= 2100
      ? fallbackYear
      : currentYear;

  if (yearParam === undefined || yearParam === null || yearParam === "") {
    return safeFallback; // Allow missing year
  }
  const year = Number(yearParam);
  // Adjust range as needed
  if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
    return year;
  }
  return safeFallback;
}
