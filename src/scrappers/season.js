import { validateYear } from "src/utils/date";

export function getSeason() {
  const today = new Date();
  let raceSeason = today.getFullYear();

  if (process.env.SEASON) {
    raceSeason = validateYear(process.env.SEASON, raceSeason);
  }

  console.log(`Current season: ${raceSeason}`);
  return raceSeason;
}
