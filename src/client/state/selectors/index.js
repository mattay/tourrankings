import store from "../storeInstance";
import { rankings } from "./filters/rankings";
import { rankingLabels } from "./filters/rankingLabels";
import { raceStages } from "./filters/stages";

/**
 * Registers selector functions on the provided store instance.
 * Selectors compute derived data such as stage results, classification standings,
 * and chart-ready datasets, based on the current store state.
 *
 * @returns {void}
 */
export function setupSelectors() {
  store.registerSelector("raceStages", raceStages);

  store.registerSelector("rankingLabels", rankingLabels);

  store.registerSelector("rankings", rankings);
}
