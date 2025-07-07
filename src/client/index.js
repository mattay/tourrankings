// State Management
import store from "./state/storeInstance";
import { setupSelectors } from "./state/selectors";
import { fetchRaceData } from "./api/index.js";
// Utils
import { getRaceInfoFromUrlPath } from "./state/browser/location";
import { parseRaceContent } from "./domain/cycling/parse";
// Components
import { Race } from "./components/race/race.js";
import { updatePageHeadings } from "./components/page/title";
import {
  setupClassificationTabs,
  updateClassificationTabs,
} from "./components/page/classification-tabs";
import { updateUrl } from "./state/browser/history";
import { validateClassification } from "src/core/cycling/classification/classification";
import { validateStage } from "src/core/cycling/stage/stage";
import { validateYear } from "src/utils/date";

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
      const { raceId, year, stage, classification } = getRaceInfoFromUrlPath();
      store.setState({
        isLoading: true,
        selected: {
          raceId,
          year: validateYear(year),
          stage: validateStage(stage, null),
          classification: validateClassification(classification),
        },
      });

      // Fetch data
      const rawData = await fetchRaceData(raceId, year);
      const processedData = parseRaceContent(rawData);

      // Update state and notify components
      const previouslySelected = store.getState().selected;
      store.setState({
        sportData: processedData,
        previouslySelected,
        selected: {
          ...previouslySelected,
          stage: validateStage(stage, processedData.stagesCompleted),
        },
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
