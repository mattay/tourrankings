/**
 * Updates the URL to reflect the current classification selection
 * @param {import('../../state/store/@types/store').State} state
 * @returns {void}
 */

export function updateUrl(state) {
  const { currentRaceId, currentYear, stage, currentClassification } = state;

  // Construct new URL path
  const pathBase = `/race/${currentRaceId}/${currentYear}`;
  const pathStage = stage ? `/${stage}` : "";
  const pathClassification =
    stage && currentClassification ? `/${currentClassification}` : "";

  const newPath = `${pathBase}${pathStage}${pathClassification}`;

  if (newPath !== window.location.pathname) {
    // Update URL without triggering page reload
    window.history.pushState(
      {
        raceId: currentRaceId,
        year: currentYear,
        stage: stage,
        classification: currentClassification,
      },
      "",
      newPath,
    );
  }
}
