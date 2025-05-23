// State Management
import store from "./state/storeInstance";
import { setupSelectors } from "./state/selectors";
import { fetchRaceData } from "./api/index.js";
// Utils
import { getRaceInfoFromUrlPath } from "./utils";
import { parseRaceContent } from "./utils/parse";
// Components
import { Race } from "./components/race/race.js";

class tourRankingApp {
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
      const processedData = parseRaceContent(rawData);

      // Update state and notify components
      store.setState({
        raceData: processedData,
        currentStage: stage || processedData.stagesCompleted,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize race app:", error);
      store.setState({ error: error.message, isLoading: false });
    }
  }
}

// Initialize the client when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new tourRankingApp();
});
