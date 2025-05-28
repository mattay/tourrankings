// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// State Managment
import store from "src/client/state/storeInstance";
import { actionSelectStage } from "src/client/state/actions";
// Components
import { createStageComponent } from "../stage/stage";
import { createRiderComponent } from "../rider/rider";
import { createRankingComponent } from "../ranking/ranking";
// Utils

/**
 * @typedef {import('d3')} d3
 */

/**
 * @typedef {CustomEvent<import('../../api/@types').RaceContent>} RaceContent
 */

/** @typedef {import('../../state/selectors/@types/stage').FilteredStage} FilteredStage */
/** @typedef {import('../../state/selectors/@types/rider').FilteredStageRider} FilteredStageRider */
/** @typedef {import('../../state/selectors/@types/result').FilteredStageResult} FilteredStageResult */

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

  /** @type {Array<FilteredStageRider>} */ // Adjust path/type as needed
  dataRiders = [];

  /** @type {Array<FilteredStageResult>} */ // Adjust path/type as needed
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
      text: 8,
    };

    this.initialize();

    this.unsubscribe = store.subscribe((state) => {
      this.dataViewStage = state.currentStage;
      // Only re-render if we have race data and it's different from what we have
      if (!state.isLoading && state.raceData) {
        //&& (!this.data || this.data !== state.raceData)
        this.updateData();
        this.resize(); // Need dimensions for setting scales
        this.updateScalesDomain();
        this.updateScalesRange();
        this.render();
      }
    });
  }

  /**
   * Initializes the visualization by setting up scales, containers, and event listeners.
   * Creates SVG groups for stages and riders, positions them according to calculated coordinates,
   * and adds a window resize listener to handle responsive layout.
   */
  initialize() {
    // Scales
    this.xScaleStages = d3.scaleLinear();
    this.yScaleRiders = d3.scaleLinear();

    // Stages
    this.containerStages = this.svg
      .append("g")
      .attr("class", "stage-container")
      .attr(
        "transform",
        `translate(${this.coordinates.stages.left}, ${this.coordinates.stages.top})`,
      );

    // Riders
    this.containerRiders = this.svg
      .append("g")
      .attr("class", "rider-container")
      .attr(
        "transform",
        `translate(${this.coordinates.rankings.left}, ${this.containerHeight(this.coordinates.stages)})`,
      );

    // Rankings
    this.containerRankings = this.svg
      .append("g")
      .attr("class", "ranking-container")
      .attr(
        "transform",
        `translate(${this.coordinates.rankings.left}, ${this.containerHeight(this.coordinates.stages)})`,
      );

    // Event Listeners
    window.addEventListener("resize", () => {
      this.resize();
    });
  }

  /**
   * Updates the data properties of the visualization from the store.
   * @property {Array} dataStages - Current stages data.
   * @property {Array} dataRiders - Current riders data.
   * @property {Array} dataRankings - Current rankings data.
   */
  updateData() {
    this.dataStages = store.select("raceStages");
    this.dataRiders = store.select("riders");
    this.dataRankings = store.select("rankings");
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

  /**
   * Updates the stages visualization component.
   * Only updates if stages data is available.
   * Uses the configured stage component to render the stages.
   */
  updateStages() {
    if (!this.dataStages) return;

    const stageComponent = createStageComponent({
      xScale: this.xScaleStages,
      offsets: this.offsets,
      onStageClick: actionSelectStage,
    });

    stageComponent(this.containerStages, this.dataStages);
  }

  /**
   * Updates the rankings visualization component.
   * Only updates if riders and rankings data are available.
   * Uses the configured rider component to render the rankings.
   */
  updateRankings() {
    if (!this.dataRiders) return;
    if (!this.dataRankings) return;

    const riderComponent = createRiderComponent({
      xScale: this.xScaleStages,
      yScale: this.yScaleRiders,
      offsets: this.offsets,
      stage: this.dataViewStage,
      onRiderClick: (rider) => {
        console.log("Rider clicked:", rider); // Future Feature
      },
    });

    riderComponent(this.containerRiders, this.dataRiders);

    const rankingComponent = createRankingComponent({
      xScale: this.xScaleStages,
      yScale: this.yScaleRiders,
      offsets: this.offsets,
      stage: this.dataViewStage,
      onRiderClick: (rider) => {
        console.log("Rider clicked:", rider); // Future Feature
      },
    });

    rankingComponent(this.containerRankings, this.dataRankings);
  }

  /**
   * Renders the visualization by updating the stages and rankings components.
   * This method is typically called after data or layout changes.
   */
  render() {
    this.updateStages();
    this.updateRankings();
  }

  /**
   * Clean up any subscriptions or event listeners when component is destroyed
   */
  destroy() {
    // Clean up store subscription
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    // Clean up event listeners
    window.removeEventListener("resize", this.resize);
    // document.removeEventListener(
    //   EVENT_TYPES.STAGE_CHANGED,
    //   this.handleStageChange,
    // );
  }
}
