// State Management
import store from "./state/storeInstance";
import { setupSelectors } from "./state/selectors";
import { fetchRaceData } from "./api/index.js";
// Utils
import { getRaceInfoFromUrlPath } from "./utils";
import { parseRaceContent } from "./utils/parse";
// Components
import { Race } from "./components/race/race.js";

/**
 * Main application class for the Tour Ranking app.
 * Manages state, data fetching, and component initialization.
 */
class tourRankingApp {
  constructor() {
    setupSelectors();
    this.race = new Race("race-rankings"); // Initialize components (SVG + D3)
    this.setupControls();
    this.init(); // Start the application
  }

  /**
   * Sets up UI controls for changing view and chart types.
   */
  setupControls() {
    // Set up controls for changing view type
    // document
    //   .getElementById("btn-stage-results")
    //   .addEventListener("click", () => {
    //     changeViewType("stageResults");
    //   });
    // // Set up controls for changing chart type
    // const chartTypeSelect = document.getElementById("chart-type-select");
    // chartTypeSelect.addEventListener("change", (e) => {
    //   changeChartType(e.target.value);
    // });
  }

  /**
   * Initializes the client: fetches data, updates state, and notifies components.
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
