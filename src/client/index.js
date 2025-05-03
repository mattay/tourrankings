import { path } from "d3";
import { fetchRaceData } from "./api.js";

class RaceClient {
  constructor() {
    this.raceData = null;
    this.stageData = null;
    this.currentStage = null;
    this.svgContainer = document.querySelector("#race-rankings svg");

    // Initialize the client
    this.init();
  }

  /**
   * Initialize the client
   */
  async init() {
    try {
      const pathParts = window.location.pathname
        .split("/")
        .filter((part) => part);
      // if (pathParts.length < 2) return;

      const raceID = pathParts[1];
      const year =
        pathParts.length > 2
          ? parseInt(pathParts[2])
          : new Date().getFullYear();
      const stage = pathParts.length > 4 ? parseInt(pathParts[4]) : null;

      console.log("pathParts", raceID, year, stage);
      // Fetch race data
      const data = await fetchRaceData(raceID, year);

      console.log(Object.keys(data));

      // Store the data
      this.raceData = data.race;
      this.stageData = data.stages;
      this.currentStage = data.viewingStage; 

      console.log("Race data loaded:", this.raceData);
      console.log("Current stage:", this.currentStage);
      // this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize race client:", error);
      // this.displayError("Failed to load race data. Please try again later.");
    }
  }
}

// Initialize the client when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new RaceClient();
});
