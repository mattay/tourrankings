/**
 *
 * @param {RawRace} race
 * @returns {Race}
 */
export function parseRace(race) {
  return {
    ...race,
    year: Number(race.year),
    startDate: new Date(race.startDate),
    endDate: new Date(race.endDate),
  };
}
