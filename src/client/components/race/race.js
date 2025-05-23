// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// State Managment
import store from "src/client/state/storeInstance";
import { actionSelectStage } from "src/client/state/actions";
// Components
import { createStageComponent } from "../stage/stage";
import { createRiderComponent } from "../rider/rider";
// Utils

/**
 * @typedef {import('d3')} d3
 */

/**
 * @typedef {CustomEvent<import('../../api/@types').RaceContent>} RaceContent
 */
/** @typedef {Array<import('../../utils/parse/raceContent/stage.d').Stage>} Stage */
/** @typedef {Array<import('../../utils/parse/raceContent/riders.d').Rider>} Rider */
/** @typedef {Array<import('../../utils/parse/raceContent/results.d').Results>} Results */

/**
 * @typedef {Object} Margin
 * @property {number} top
 * @property {number} right
 * @property {number} bottom
 * @property {number} left
 */

/**
 * @typedef {Object} options
 * @prop {Margin} margin
 */

/**
 * @typedef {Object} Coordinates
 * @property {number} top
 * @property {number} bottom
 * @property {number} left
 * @property {number} right
 * @property {number} width
 * @property {number} height
 */

/** @type {options} */
const DEFAULT_OPTIONS = {
  margin: { top: 8, right: 8, bottom: 16, left: 8 },
};

/**
 * Represents a race visualization, managing layout and rendering of stages and rankings.
 */
export class Race {
  /** @type {Array<Stage>} */
  dataStages = [];
  /** @type {Array<Rider>} */ // Adjust path/type as needed
  dataRiders = [];
  /** @type {Array<Ranking>} */ // Adjust path/type as needed
  dataRankings = [];
  /** @type {number | null} */ // Adjust as needed
  dataViewStage = null;
  /** @type {HTMLElement} */
  container;
  /** @type {d3.Selection} */
  svg;
  /** @type {Margin} */
  margin;
  /** @type {{stages: Coordinates, rankings: Coordinates}} */
  coordinates;
  /** @type {{radius: number, text: number}} */
  offsets;
  /** @type {Function} */
  unsubscribe;

  /**
   * Creates a new Race visualization.
   * @param {string} containerId - The ID of the DOM element to contain the visualization.
   * @param {object} options - Configuration options for the visualization.
   * @param {Partial<Margin>} [options.margin] - Margins for the visualization.
   */
  constructor(
    containerId,
    options = {
      margin: { top: 40, right: 320, bottom: 60, left: 8 },
    },
  ) {
    console.log("Race constructor");
    this.container = document.getElementById(containerId);
    this.svg = d3.select(this.container).append("svg");

    this.height = 0;
    this.width = 0;
    this.margin = options.margin;
    this.innerWidth = 0;
    this.innerHeight = 0;

    this.coordinates = {
      stages: {
        top: this.margin.top,
        bottom: 40,
        left: this.margin.left,
        right: this.innerWidth - this.margin.right,
        width: this.innerWidth - this.margin.left - this.margin.right,
        height: 40,
      },
      rankings: {
        top: this.margin.top + 40,
        bottom: this.margin.bottom,
        left: this.margin.left,
        right: this.innerWidth - this.margin.right,
        width: this.innerWidth - this.margin.left - this.margin.right,
        height: this.innerHeight - this.margin.top - this.margin.bottom - 40,
      },
    };

    this.offsets = {
      radius: 12,
      text: 4,
    };

    this.initialize();
  }

  /**
   * Initializes the visualization by setting up scales, containers, and event listeners.
   * Creates SVG groups for stages and riders, positions them according to calculated coordinates,
   * and adds a window resize listener to handle responsive layout.
   */
  initialize() {
    // Update sizing dimensions
    this.resized();

    this.containerStages = this.svg
      .append("g")
      .attr("class", "stage-container");
    // .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    this.containerRiders = this.svg
      .append("g")
      .attr("class", "rider-container")
      .attr("transform", `translate(24, 64)`);

    console.debug("Race initializing Event listerns...");
    window.addEventListener("resize", () => {
      console.log("Event", "resized");
      this.resized();
    });

    document.addEventListener(EVENT_TYPES.RACE_DATA_LOADED, (event) => {
      /**
       * @type {CustomEvent<import('../../api/@types').RaceContent>}
       */
      const eventRaceDataLoaded = /** @type {CustomEvent} */ (event);
      console.log("Event", "race-data-loaded");
      console.log("Event", eventRaceDataLoaded.detail);
      this.data = eventRaceDataLoaded.detail;
      this.render();
    });
    console.log("Race initialized");
  }

  resized() {
    // Take the size of the container element
    this.height = this.container.clientHeight;
    this.width = this.container.clientWidth;
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;

    this.coordinates.stages.right = this.innerWidth - this.margin.right;
    this.coordinates.stages.width =
      this.coordinates.stages.right - this.margin.left;
    this.coordinates.rankings.right = this.innerWidth - this.margin.right;
    this.coordinates.rankings.width =
      this.coordinates.rankings.right - this.margin.left;
    console.log("Event", "resized");
  }

  render() {
    console.log(this.data);
    this.updateStages();
    this.updateRankings();
    console.log("Race rendered");
  }

  updateStages() {
    const stages = this.data.stages;
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(stages, (d) => d.stage))
      .range([this.margin.left, this.innerWidth]);
    const stageComponent = createStageComponent({
      xScale,
      offsets: this.offsets,
      onStageClick: (stage) => {
        console.log("Stage clicked:", stage);
      },
    });

    stageComponent(this.containerStages, stages);

    console.log("Stage rendered");
  }

  updateRankings() {
    // Convert map to array of rider objects
    const riders = Array.from(this.data.riders.values());

    // TODO: fix Scales Bib id range is bigger than ranking range
    const yScale = d3
      .scaleLinear()
      .domain([0, riders.length])
      .range([0, riders.length * 20]);

    console.log(yScale(1));

    const riderComponent = createRiderComponent({
      yScale,
      offsets: this.offsets,
      onRiderClick: (rider) => {
        console.log("Rider clicked:", rider);
      },
    });

    riderComponent(this.containerRiders, riders);

    console.log("Rankings rendered");
  }
}
