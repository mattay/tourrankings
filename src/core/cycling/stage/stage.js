/**
 * Validates a stage parameter.
 * @param {any} stage - The stage value to validate.
 * @param {number} fallbackStage - The fallback stage to use if the input is invalid.
 * @returns {number|null} - Returns the valid stage as a number, or null if invalid.
 */
export function validateStage(stage, fallbackStage = null) {
  if (stage === undefined || stage === null || stage === "") {
    return fallbackStage; // Allow missing stage
  }
  const stageNumber = Number(stage);
  if (!Number.isInteger(stageNumber) || stageNumber < 0) {
    console.warn("Invalid stage number", stageNumber);
    return fallbackStage;
  }

  return stageNumber;
}
