/**
 *
 * @param {RawStage} stage
 * @returns {Stage}
 */
export function parseStage(stage) {
  return {
    ...stage,
    year: Number(stage.year),
    stage: Number(stage.stage),
    date: new Date(stage.date),
    distance: Number(stage.distance),
    verticalMeters: Number(stage.verticalMeters),
  };
}
