/**
 * Updates the URL to reflect the current classification selection
 * @param {import('../../state/store/@types/store').State} state
 * @returns {void}
 */

export function updateUrl(state) {
  const { currentRaceId, currentYear, currentStage, currentClassification } =
    state;

  // Construct new URL path
  const pathBase = `/race/${currentRaceId}/${currentYear}`;
  const pathStage = currentStage ? `/${currentStage}` : "";
  const pathClassification =
    currentStage && currentClassification ? `/${currentClassification}` : "";

  const newPath = `${pathBase}${pathStage}${pathClassification}`;

  if (newPath !== window.location.pathname) {
    // Update URL without triggering page reload
    window.history.pushState(
      {
        raceId: currentRaceId,
        year: currentYear,
        stage: currentStage,
        classification: currentClassification,
      },
      "",
      newPath,
    );
  }
}
