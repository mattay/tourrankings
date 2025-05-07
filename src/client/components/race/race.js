// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { EVENT_TYPES } from "../../state/events";
import { createStageComponent } from "../stage/stage";
import { createRiderComponent } from "../rider/rider";

export class Race {
  /**
   *
   * @param {string} containerId
   * @param {object} options
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

  initialize() {
    // Update sizing dimensions
    this.resized();

    this.containerStages = this.svg
      .append("g")
      .attr("class", "stage-container");
    // .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
    this.containerRiders = this.svg
      .append("g")
      .attr("class", "rider-container");

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
