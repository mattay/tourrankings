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
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.svg = d3.select(this.container).append("svg");

    /** @type {Margin} */
    this.margin = { ...DEFAULT_OPTIONS.margin, ...options.margin };

    this.coordinates = this.calculateCoordinates();
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

  /**
   * Updates the domains of the scales based on the current data.
   * @property {d3.ScaleLinear} xScaleStages - Scale for stage positions.
   * @property {d3.ScaleLinear} yScaleRiders - Scale for rider positions.
   */
  updateScalesDomain() {
    this.xScaleStages.domain(d3.extent(this.dataStages, (d) => d.stage));
    this.yScaleRiders.domain([0, this.dataRiders.length]);
  }

  /**
   * Updates the ranges of the scales based on the current layout coordinates.
   * @property {d3.ScaleLinear} xScaleStages - Scale for stage positions.
   * @property {d3.ScaleLinear} yScaleRiders - Scale for rider positions.
   */
  updateScalesRange() {
    this.xScaleStages.range([this.margin.left, this.coordinates.stages.width]);
    this.yScaleRiders.range([0, this.coordinates.rankings.height]);
  }

  /**
   * Adds together top, height, and bottom from a coordinates object.
   * @param {Coordinates} coordinates
   * @returns {number}
   */
  containerHeight(coordinates) {
    return (
      Number(coordinates.top) +
      Number(coordinates.height) +
      Number(coordinates.bottom)
    );
  }

  /**
   * Calculates the layout coordinates for stages and rankings containers.
   * @returns {{stages: Coordinates, rankings: Coordinates}}
   */
  calculateCoordinates() {
    const numberOfRiders = this.dataRiders.filter(
      (element) => element != null,
    ).length;
    const { top, right, bottom, left } = this.margin;
    const riderLabelWidth = 320;
    const riderLabelHeight = 20;
    const riderRankingHeight = numberOfRiders * riderLabelHeight;

    const stagesCoordinates = {
      top,
      bottom: 32,
      left,
      right: this.innerWidth - right,
      width: this.innerWidth - riderLabelWidth,
      height: 40,
    };
    const rankingsCoordinates = {
      top,
      bottom,
      left,
      right: this.innerWidth - right,
      width: this.innerWidth - riderLabelWidth,
      height: numberOfRiders ? riderRankingHeight : this.innerHeight,
    };

    return {
      stages: stagesCoordinates,
      rankings: rankingsCoordinates,
    };
  }

  /**
   * Handles resizing of the visualization container.
   * Updates the inner width and height based on the container's current size and margins,
   * recalculates the coordinates for stages and rankings, and resizes the SVG to fit the content.
   * Note: The SVG height is calculated by adding the heights of stages and rankings containers,
   * but ensure this logic matches your layout requirements (see earlier discussion on double-counting).
   */
  resize() {
    const visableWidth = this.container.clientWidth;
    const visableHeight = this.container.clientHeight; // Visable.
    // Update container dimensions
    this.innerWidth = visableWidth - this.margin.left - this.margin.right;
    this.innerHeight = visableHeight - this.margin.top - this.margin.bottom;

    // Recalculate coordinates
    this.coordinates = this.calculateCoordinates();

    // Calculate the total height needed for the SVG
    const neededHeight =
      this.containerHeight(this.coordinates.stages) +
      this.containerHeight(this.coordinates.rankings);
    this.svg.attr("width", visableWidth).attr("height", neededHeight);
    // Calculate group sizing
    // const gNode = this.containerStages.node();
    // const gBBox = gNode.getBBox(); // Only works if the <g> has children with visible content
    // if (gBBox) {
    //   console.log("gBBox Width:", gBBox.width);
    //   console.log("gBBox Height:", gBBox.height);
    // }
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
