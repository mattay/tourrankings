/**
 * @typedef {import('./@types/race').RawRace} RawRace
 * @typedef {import('./@types/race').Race} Race
 */

/**
 * Parses a raw race object into a Race object.
 * Converts the year to a number and start/end dates to Date objects.
 * @param {RawRace} race - The raw race data to parse.
 * @returns {Race} The parsed race object.
 */
export function parseRace(race) {
  return {
    ...race,
    // startDate: new Date(race.startDate),
    // endDate: new Date(race.endDate),
  };
}
