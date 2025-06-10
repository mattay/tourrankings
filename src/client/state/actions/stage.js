// State Management
import store from "../storeInstance";
import { EVENT_TYPES, dispatch } from "../events";
// Utils
import { getRaceInfoFromUrlPath } from "../../../../src/client/utils";

/**
 * @typedef {import('../../models/@types/stage.d').RaceStageData} RaceStageData
 */

/**
 *
 * @param {RaceStageData} stage
 */
export function actionSelectStage(stage) {
  const stageNumber = stage.stage;
  // Update URL
  const pathParts = getRaceInfoFromUrlPath();
  pathParts.stage = stageNumber;
  const url = "/" + Object.values(pathParts).join("/");
  window.history.pushState(
    { stageUID: stage.stageUID },
    `Stage ${stageNumber}`,
    url,
  );

  // Update store
  store.setState({ currentStage: stageNumber });

  // Dispatch event
  dispatch(EVENT_TYPES.STAGE_CHANGED, stageNumber);
}
