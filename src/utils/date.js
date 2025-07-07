// https://stackoverflow.com/a/3552493/5250085
function dateTimeFormater(date, options, separator) {
  function format(option) {
    let formatter = new Intl.DateTimeFormat("en", option);
    return formatter.format(date);
  }
  return options.map(format).join(separator);
}

export function isoDateTime(date) {
  const dayOptions = [
    { year: "numeric" },
    { month: "2-digit" },
    { day: "2-digit" },
  ];
  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
    fractionalSecondDigits: 3,
  };

  const day = dateTimeFormater(date, dayOptions, "-");
  const time = new Intl.DateTimeFormat("en-AU", timeOptions).format(date);

  return `${day} ${time}`;
}

/**
 * Validates a year parameter.
 * @param {any} yearParam - The year value to validate.
 * @param {number} fallbackYear - The fallback year to use if the input is invalid.
 * @returns {number|null} - Returns the valid year as a number, or null if invalid.
 */
export function validateYear(
  yearParam,
  fallbackYear = new Date().getFullYear(),
) {
  if (yearParam === undefined || yearParam === null || yearParam === "") {
    return fallbackYear; // Allow missing year
  }
  const year = Number(yearParam);
  // Adjust range as needed
  if (Number.isInteger(year) && year >= 1900 && year <= 2100) {
    return year;
  }
  return fallbackYear;
}
