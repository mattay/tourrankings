/**
 * @typedef {import('./riders.d').RawRider} RawRider
 * @typedef {import('./riders.d').Rider} Rider
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
