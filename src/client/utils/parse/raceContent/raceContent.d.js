/**
 * @typedef {import('./race.d').RawRace} RawRace
 * @typedef {import('./stage.d').RawStage} RawStage
 * @typedef {import('./teams.d').RawRaceTeams} RawRaceTeams
 * @typedef {import('./riders.d').RawRaceRiders} RawRaceRiders
 * @typedef {import('./results.d').RawRaceResults} RawRaceResults
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
 * @typedef {import('./race.d').Race} Race
 * @typedef {import('./stage.d').Stage} Stage
 * @typedef {import('./teams.d').RaceTeams} RaceTeams
 * @typedef {import('./riders.d').RaceRiders} RaceRiders
 * @typedef {import('./results.d').RaceResults} RaceResults
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
