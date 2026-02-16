import { validateYear } from "@utils/date";
import { logOut } from "@utils/logging";

export function getSeason() {
  const today = new Date();
  let raceSeason = today.getFullYear();

  if (process.env.SEASON) {
    raceSeason = validateYear(process.env.SEASON, raceSeason);
  }

  logOut("Season", `${raceSeason}`, "info");
  return raceSeason;
}
