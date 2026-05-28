import { getErrorHTML } from "@server/utils/errorMessages";

export function seasonRacesPresenter(races, { season = null } = {}) {
  const hasRaceData =
    races &&
    (races.current?.length > 0 ||
      races.upcoming?.length > 0 ||
      races.previous?.length > 0 ||
      races.future?.length > 0);

  return {
    title: season ? `Season ${season} | Tour Rankings` : "Tour Rankings",
    description: season
      ? `Race calendar for season ${season}`
      : "A web application for tracking and ranking tours.",
    keywords: season
      ? `cycling, tour, ranking, season ${season}`
      : "cycling, tour, ranking",
    races: hasRaceData ? races : null,
    season,
    hasError: !hasRaceData,
    ...(!hasRaceData ? { errorMessage: getErrorHTML("NO_DATA") } : {}),
  };
}
