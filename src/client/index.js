import { path } from "d3";
import { prepRaceData } from "./raceData.js";
import { racePathParts } from "./page.js";

class RaceClient {
  data = {};

  constructor() {
    this.svgContainer = document.querySelector("#race-rankings svg");

    // Initialize the client
    this.init();
  }

  /**
   * Initialize the client
   */
  async init() {
    try {
      const { raceID, year } = racePathParts();
      await this.updateData(raceID, year);

      // this.setupEventListeners();
    } catch (error) {
      console.error("Failed to initialize race client:", error);
      // this.displayError("Failed to load race data. Please try again later.");
    }

    console.log(this.data);
  }

  /**
   * Update the data for the race
   * @param {string} raceID - The ID of the race
   * @param {number} year - The year of the race
   */
  async updateData(raceID, year) {
    // Implement data update logic here

    this.data = await prepRaceData(raceID, year);
  }
}

// Initialize the client when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new RaceClient();
});
