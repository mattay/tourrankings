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

  const stageNumber = Number(stage.stage);
  if (Number.isNaN(stageNumber)) {
    console.warn("Invalid stage number");
    return;
  }

  // Update store
  const previouslySelected = store.getState().selected;
  store.setState({
    previouslySelected,
    selected: {
      ...previouslySelected,
      stage: stageNumber,
    },
  });
}
