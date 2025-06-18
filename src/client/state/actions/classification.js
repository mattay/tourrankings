import store from "../storeInstance";

/**
 * Action to change the current classification/ranking type
 * @param {string} classificationType - The classification type to switch to
 * @returns {void}
 */
export function actionSelectClassification(classificationType) {
  if (!classificationType) {
    console.warn("Classification type is required");
    return;
  }

  store.setState({
    currentClassification: classificationType,
  });
}
