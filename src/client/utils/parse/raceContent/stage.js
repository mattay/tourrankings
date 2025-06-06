/**
 * @typedef {import('./@types/stages').RawStage} RawStage
 * @typedef {import('./@types/stages').Stage} Stage
 */

/**
 * Parses a raw stage object into a Stage object.
 * Optionally converts the date string to a Date object.
 * @param {RawStage} stage - The raw stage data to parse.
 * @returns {Stage} The parsed stage object.
 */
export function parseStage(stage) {
  return {
    ...stage,
    //   date: new Date(stage.date),
  };
}
