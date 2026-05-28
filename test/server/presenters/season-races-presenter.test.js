import { describe, it, expect } from "bun:test";
import { seasonRacesPresenter } from "@server/presenters/season-races-presenter";

describe("seasonRacesPresenter", () => {
  const mockRaces = {
    current: [
      {
        raceName: "Tour de France",
        racePcsID: "tour-france",
        year: 2026,
      },
    ],
    upcoming: [],
    previous: [
      {
        raceName: "Paris-Nice",
        racePcsID: "paris-nice",
        year: 2026,
      },
    ],
    future: [],
  };

  it("should return races in page data when data exists", () => {
    const result = seasonRacesPresenter(mockRaces);

    expect(result.races).toEqual(mockRaces);
    expect(result.hasError).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });

  it("should set hasError when all race arrays are empty", () => {
    const result = seasonRacesPresenter({
      current: [],
      upcoming: [],
      previous: [],
      future: [],
    });

    expect(result.races).toBeNull();
    expect(result.hasError).toBe(true);
    expect(result.errorMessage).toBeDefined();
  });

  it("should set hasError when races is null", () => {
    const result = seasonRacesPresenter(null);

    expect(result.races).toBeNull();
    expect(result.hasError).toBe(true);
    expect(result.errorMessage).toBeDefined();
  });

  it("should use default title and description for current season", () => {
    const result = seasonRacesPresenter(mockRaces);

    expect(result.title).toBe("Tour Rankings");
    expect(result.description).toBe(
      "A web application for tracking and ranking tours.",
    );
  });

  it("should use season-specific title and description when season is provided", () => {
    const result = seasonRacesPresenter(mockRaces, { season: 2025 });

    expect(result.title).toBe("Season 2025 | Tour Rankings");
    expect(result.description).toBe("Race calendar for season 2025");
  });

  it("should include season in keywords when provided", () => {
    const result = seasonRacesPresenter(mockRaces, { season: 2025 });

    expect(result.keywords).toContain("season 2025");
  });

  it("should not include season in keywords when not provided", () => {
    const result = seasonRacesPresenter(mockRaces);

    expect(result.keywords).toBe("cycling, tour, ranking");
  });

  it("should pass through the season value", () => {
    const result = seasonRacesPresenter(mockRaces, { season: 2025 });

    expect(result.season).toBe(2025);
  });

  it("should default season to null when not provided", () => {
    const result = seasonRacesPresenter(mockRaces);

    expect(result.season).toBeNull();
  });
});
