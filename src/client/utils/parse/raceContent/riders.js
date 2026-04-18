/**
 * @typedef {import('./@types/riders').RawRider} RawRider
 * @typedef {import('./@types/riders').Rider} Rider
 */

/**
 * Parses a raw rider object, converting relevant fields and adding default values.
 * @param {RawRider} rawRider - The raw rider data to parse.
 * @returns {Rider} A parsed rider object.
 */
export function parseRider(rawRider) {
  return {
    ...rawRider,
    team: null,
  };
}
