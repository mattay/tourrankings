import { actionSelectClassification } from "src/client/state/actions";
import {
  CLASSIFICATION_TYPES,
  isValidClassificationType,
} from "src/core/cycling/classification/classification";

const CLASSIFICATION_ELEMENT_CLASS = {
  CONTAINER: ".tabs-container",
  TAB: ".tab",
};

/**
 * Sets up event listeners for classification tab controls
 * @returns {void}
 */
export function setupClassificationTabs() {
  const tabsContainer = document.querySelector(
    CLASSIFICATION_ELEMENT_CLASS.CONTAINER,
  );
  if (!tabsContainer) return;

  // Use event delegation to handle clicks on tab buttons
  tabsContainer.addEventListener("click", (event) => {
    const tabButton = event.target.closest(".tab");
    if (!tabButton) return;

    const classificationType = tabButton.dataset.classification;
    if (!classificationType) return;

    actionSelectClassification(classificationType);
  });
}

/**
 * Updates the active tab visual state
 * @param {import('../../state/store/@types/store').State} state
 * @returns {void}
 */
export function updateClassificationTabs(state) {
  const currentClassification = isValidClassificationType(
    state.currentClassification,
  )
    ? state.currentClassification
    : CLASSIFICATION_TYPES.STAGE;

  const activeTab = document.querySelector(
    `[data-classification="${currentClassification}"]`,
  );
  if (!activeTab) return;

  // Locate the surrounding tab container
  const tabsContainer = activeTab.closest(
    CLASSIFICATION_ELEMENT_CLASS.CONTAINER,
  );

  // Remove active class from all tabs
  tabsContainer
    .querySelectorAll(CLASSIFICATION_ELEMENT_CLASS.TAB)
    .forEach((tab) => {
      tab.classList.remove("active");
    });

  // Add active class to clicked tab
  activeTab.classList.add("active");
}
