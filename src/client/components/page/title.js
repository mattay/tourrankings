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
  const stageLabel = document.getElementById("stage-label");
  const stageNumber = document.getElementById("stage-number");
  const stageType = document.getElementById("stage-type");
  const stageDeparture = document.getElementById("stage-depature");
  const stageArrival = document.getElementById("stage-arrival");

  if (state.raceData && state.currentStage) {
    const stage = state.raceData.stages[state.currentStage];
    if (!stage) return;

    if (stage.stageType == "prologue") {
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
