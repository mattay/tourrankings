import store from "../storeInstance";

/**
 * @typedef {import('../../models/@types/stage').RaceStageData} RaceStageData
 */

/**
 *
 * @param {RaceStageData} stage
 * @returns {void}
 */
export function actionSelectStage(stage) {
  if (!stage && stage.stage) {
    console.warn("Stage is required");
    return;
  }

  // Update store
  const stageNumber = stage.stage;
  store.setState({ currentStage: stageNumber });
}
