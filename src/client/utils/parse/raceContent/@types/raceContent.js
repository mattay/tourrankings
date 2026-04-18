/**
 * @typedef {import('./race').RawRace} RawRace
 * @typedef {import('./stages').RawStage} RawStage
 * @typedef {import('./teams').RawRaceTeams} RawRaceTeams
 * @typedef {import('./riders').RawRaceRiders} RawRaceRiders
 * @typedef {import('./results').RawRaceResults} RawRaceResults
 */

/**
 * @typedef {object} RawRaceContent
 * @property {RawRace} race - The raw race data.
 * @property {RawStage[]} stages - Array of raw stage data.
 * @property {number} stagesCompleted - Number of stages completed.
 * @property {RawRaceTeams} teams - Raw teams data.
 * @property {RawRaceRiders} riders - Raw riders data.
 * @property {RawRaceResults} results - Raw results data.
 */

/**
 * @typedef {import('./race').Race} Race
 * @typedef {import('./stages').Stage} Stage
 * @typedef {import('./teams').RaceTeams} RaceTeams
 * @typedef {import('./riders').RaceRiders} RaceRiders
 * @typedef {import('./results').RaceResults} RaceResults
 */

/**
 * @typedef {object} RaceContent
 * @property {Race} race - The parsed race data.
 * @property {Stage[]} stages - Array of parsed stage data.
 * @property {number} stagesCompleted - Number of stages completed.
 * @property {RaceTeams} teams - Parsed teams data.
 * @property {RaceRiders} riders - Parsed riders data.
 * @property {RaceResults} results - Parsed results data.
 */

export {};
