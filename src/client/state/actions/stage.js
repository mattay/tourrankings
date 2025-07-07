import { validateStage } from "src/core/cycling/stage/stage";
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
  if (!stage || stage.stage === null) {
    console.warn("Stage is required");
    return;
  }

  const stageNumber = validateStage(stage.stage);
  const previouslySelected = store.getState().selected;
  if (stageNumber === null || previouslySelected.stage === stageNumber) {
    return;
  }

  // Update store
  store.setState({
    previouslySelected,
    selected: {
      ...previouslySelected,
      stage: stageNumber,
    },
  });
}
