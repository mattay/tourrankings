import { validateYear } from "@utils/date";

let _season;

export function getSeason() {
  if (_season !== undefined) return _season;
  const today = new Date();
  let raceSeason = today.getFullYear();

  if (process.env.SEASON) {
    raceSeason = validateYear(process.env.SEASON, raceSeason);
  }

  _season = raceSeason;
  return raceSeason;
}
