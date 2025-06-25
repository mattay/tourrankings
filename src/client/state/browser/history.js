/**
 * Updates the URL to reflect the current classification selection
 * @param {import('../../state/store/@types/store').State} state
 * @returns {void}
 */

export function updateUrl(state) {
  const { raceId, year, stage, classification } = state.selected;

  // Construct new URL path
  const pathBase = `/race/${raceId}/${year}`;
  const pathStage = stage ? `/${stage}` : "";
  const pathClassification =
    stage && classification ? `/${classification}` : "";

  const newPath = `${pathBase}${pathStage}${pathClassification}`;

  if (newPath !== window.location.pathname) {
    // Update URL without triggering page reload
    window.history.pushState(
      {
        raceId,
        year,
        stage,
        classification,
      },
      "",
      newPath,
    );
  }
}
