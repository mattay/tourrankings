import { fetchRaceData } from "./api/index.js";
import { getRacePathInfo, prepRaceData } from "./utils/index.js";
import { store } from "./state/store.js";
import { dispatch, EVENT_TYPES } from "./state/events.js";
import { Race } from "./components/race/race.js";

class tourRankingApp {
  data = {};

  constructor() {
    // Initialize components
    this.race = new Race("race-rankings");

    // Start the application
    this.init();
  }

  /**
   * Initialize the client
   */
  async init() {
    try {
      // Update state
      const { raceID, year, stage, ranking } = getRaceInfoFromUrlPath();
      store.setState({
        isLoading: true,
        currentRaceId: raceID,
        currentYear: year,
        currentStage: stage,
        currentRanking: ranking || "results",
      });

      // Fetch data
      const rawData = await fetchRaceData(raceID, year);
      const processedData = prepRaceData(rawData);

      // Update state and notify components
      store.setState({
        raceData: processedData,
        isLoading: false,
      });

      // Dispatch event for components
      dispatch(EVENT_TYPES.RACE_DATA_LOADED, processedData);

      // If a stage was specified in the URL, notify components
      if (stage) {
        dispatch(EVENT_TYPES.STAGE_CHANGED, stage);
      }
    } catch (error) {
      console.error("Failed to initialize race app:", error);
      store.setState({ error: error.message, isLoading: false });
      dispatch(EVENT_TYPES.ERROR, error.message);
    }
  }
}

// Initialize the client when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new tourRankingApp();
});
