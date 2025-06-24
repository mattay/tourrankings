// State Management
import store from "./state/storeInstance";
import { setupSelectors } from "./state/selectors";
import { fetchRaceData } from "./api/index.js";
// Utils
import { getRaceInfoFromUrlPath } from "./state/browser/location";
import { parseRaceContent } from "./utils/parse";
// Components
import { Race } from "./components/race/race.js";
import { updatePageHeadings } from "./components/page/title";
import {
  setupClassificationTabs,
  updateClassificationTabs,
} from "./components/page/classification-tabs";
import { updateUrl } from "./state/browser/history";
import {
  CLASSIFICATION_TYPES,
  isValidClassificationType,
} from "src/core/cycling/classification/classification";

/**
 * Main application class for the Tour Ranking app.
 * Manages state, data fetching, and component initialization.
 */
class tourRankingApp {
  /**
   * @type {Function} Unsubscribe function for the store subscription
   */
  #unsubscribe;

  constructor() {
    setupSelectors();
    this.race = new Race("race-rankings"); // Initialize components (SVG + D3)
    this.setupControls();
    this.setupDOMSubscription(); // Subscribe to state changes for DOM updates
    this.init(); // Start the application
  }

  /**
   * Sets up UI controls for changing view and chart types.
   */
  setupControls() {
    setupClassificationTabs();
  }

  /**
   * Sets up subscription to state changes for DOM modifications outside SVG
   * @returns {void}
   */
  setupDOMSubscription() {
    this.#unsubscribe = store.subscribe((state) => {
      try {
        updateUrl(state);
        updatePageHeadings(state);
        updateClassificationTabs(state);
      } catch (error) {
        console.error("Failed to update page headings:", error);
      }
    });
  }

  /**
   * Initializes the client: fetches data, updates state, and notifies components.
   */
  async init() {
    try {
      // Update state
      const { raceID, year, stage, classification } = getRaceInfoFromUrlPath();
      store.setState({
        isLoading: true,
        currentRaceId: raceID,
        currentYear: year,
        selected.stage: stage,
        currentClassification: isValidClassificationType(classification)
          ? classification
          : CLASSIFICATION_TYPES.STAGE,
      });

      // Fetch data
      const rawData = await fetchRaceData(raceID, year);
      const processedData = parseRaceContent(rawData);

      // Update state and notify components
      store.setState({
        raceData: processedData,
        selected.stage: stage || processedData.stagesCompleted,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to initialize race app:", error);
      store.setState({ error: error.message, isLoading: false });
    }
  }

  /**
   * Clean up subscriptions when the app is destroyed
   * @returns {void}
   */
  destroy() {
    if (this.#unsubscribe) {
      this.#unsubscribe();
    }
    if (this.race) {
      this.race.destroy();
    }
  }
}

// Initialize the client when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new tourRankingApp();
});
