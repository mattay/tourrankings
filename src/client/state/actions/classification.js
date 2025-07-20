import {
  isValidClassificationType,
  validateClassification,
} from "src/core/cycling/classification/classification";
import store from "../storeInstance";

/**
 * Action to change the current classification/ranking type.
 *
 * @param {string} classificationType - The classification type to switch to.
 *   Allowed: "stages", "gc", "points", "youth", "team", etc. (see CLASSIFICATION_TYPES)
 * @returns {void}
 */
export function actionSelectClassification(classificationType) {
  if (!classificationType) {
    console.warn(
      "Classification type is required (received:",
      classificationType,
      ")",
    );
    return;
  }

  if (!isValidClassificationType(classificationType)) {
    console.warn(`Classification type "${classificationType}" is not valid.`);
    return;
  }

  const classification = validateClassification(classificationType);
  const previouslySelected = store.getState().selected;
  if (
    classification === null ||
    previouslySelected.classification === classification
  ) {
    return;
  }

  store.setState({
    previouslySelected,
    selected: {
      ...previouslySelected,
      classification: classificationType,
    },
  });
}
