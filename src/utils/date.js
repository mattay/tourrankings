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
