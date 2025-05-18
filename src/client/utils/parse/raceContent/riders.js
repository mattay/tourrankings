/**
 *
 * @param {RawRider} rawRider -
 * @returns {Rider}
 */
export function parseRider(rawRider) {
  return {
    ...rawRider,
    bib: Number(rawRider.bib),
    team: null,
  };
}
