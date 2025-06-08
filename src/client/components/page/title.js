/**
 * Updates text with a simple CSS transition
 * @param {HTMLElement} element - Element to update
 * @param {string} newText - New text content
 * @returns {void}
 */
function updateTextSmooth(element, newText) {
  if (!element || element.textContent === newText) return;

  // Brief opacity change to indicate update
  element.classList.add("updating");
  // Update text and remove updating class
  setTimeout(() => {
    element.textContent = newText;
    element.classList.remove("updating");
  }, 432);
}

/**
 * Updates breadcrumb navigation
 * @param {import('../../state/store/@types/store').State} state
 * @returns {void}
 */
export function updatePageHeadings(state) {
  const STAGE_ELEMENT_IDS = {
    LABEL: "stage-label",
    NUMBER: "stage-number",
    TYPE: "stage-type",
    DEPARTURE: "stage-departure",
    ARRIVAL: "stage-arrival",
  };

  const stageLabel = document.getElementById(STAGE_ELEMENT_IDS.LABEL);
  const stageNumber = document.getElementById(STAGE_ELEMENT_IDS.NUMBER);
  const stageType = document.getElementById(STAGE_ELEMENT_IDS.TYPE);
  const stageDeparture = document.getElementById(STAGE_ELEMENT_IDS.DEPARTURE);
  const stageArrival = document.getElementById(STAGE_ELEMENT_IDS.ARRIVAL);

  // Early return if critical elements are missing
  if (
    !stageLabel ||
    !stageNumber ||
    !stageType ||
    !stageDeparture ||
    !stageArrival
  ) {
    console.warn("Some stage elements not found in DOM");
    return;
  }

  if (state.raceData && state.currentStage) {
    const stage = state.raceData.stages[state.currentStage];
    if (!stage) return;

    if (stage.stageType === "prologue") {
      // Prologue
      updateTextSmooth(stageLabel, "Prologue");
      updateTextSmooth(stageType, "");
      updateTextSmooth(stageNumber, "");
    } else {
      // Not Prologue
      updateTextSmooth(stageLabel, "Stage");
      updateTextSmooth(
        stageType,
        stage.stageType ? `(${stage.stageType})` : "",
      );
      updateTextSmooth(stageNumber, stage.stage.toString());
    }
    updateTextSmooth(stageDeparture, stage.departure);
    updateTextSmooth(stageArrival, stage.arrival);
  }
}
