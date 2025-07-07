/**
 * Validates a stage parameter.
 * @param {any} stageParam - The stage value to validate.
 * @param {number} fallbackStage - The fallback stage to use if the input is invalid.
 * @returns {number|null} - Returns the valid stage as a number, or null if invalid.
 */
export function validateStage(stageParam, fallbackStage = null) {
  if (stageParam === undefined || stageParam === null || stageParam === "") {
    return fallbackStage; // Allow missing stage
  }
  const stage = Number(stageParam);
  if (Number.isInteger(stage) && stage >= 0) {
    return stage;
  }
  return fallbackStage;
}
