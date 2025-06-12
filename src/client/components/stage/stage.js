/** <reference types="d3" /> */

/**
 * @typedef {Object} StageDatum
 * @property {number|string} stage - Unique identifier for the stage
 * @property {number} [positionX] - Optional X coordinate for positioning
 * @property {number} [positionY] - Optional Y coordinate for positioning
 * @property {boolean} [raced] - Whether the stage has been raced
 * @property {boolean} [viewed] - Whether the stage has been viewed
 */

/**
 * Options for creating the stage component.
 *
 * @typedef {Object} StageComponentOptions
 * @property {number} [maxRadius=24] - Maximum radius for stage circles
 * @property {number} [fontHeight=16] - Font height used for labels
 * @property {d3.ScaleLinear<number, number>} xScale - D3 linear scale for horizontal positioning
 * @property {Object} offsets - Offsets for layout (e.g., text offset)
 * @property {function(StageDatum): void} [onStageClick] - Callback for stage click events
 * @property {number} [transitionDuration=750] - Duration for transitions in milliseconds
 */

/**
 * Creates a stage component function that binds stage data to a selection,
 * managing enter, update, and exit lifecycle with transitions and event handling.
 *
 * @param {StageComponentOptions} [options] - Configuration options for the component
 * @returns {function(d3.Selection<SVGGElement, unknown, null, undefined>, StageDatum[]): void} A function that takes a D3 selection and data array to render
 */
export function createStageComponent({
  maxRadius = 24,
  fontHeight = 16,
  xScale,
  offsets,
  onStageClick = () => {},
  transitionDuration = 840,
} = {}) {
  /** @property {number} radius */
  const halfRadius = (radius) => (radius || maxRadius) / 2;
  const halfFontHeight = fontHeight / 2;

  /**
   * Initialize entering stage groups by setting attributes, styles, and appending child elements.
   *
   * @param {d3.Selection<SVGGElement, StageDatum, any, any>} stageEnter - D3 selection of entering stage groups bound to data.
   */ const initializeStageGroup = (stageEnter) => {
    stageEnter
      .attr("class", "stage")

      .on("click", (event, d) => {
        if (d.raced) return onStageClick(d);
      });

    stageEnter
      .append("circle")
      .attr("class", "stage-indicator")
      .attr("r", 0)
      .attr("cy", halfRadius())
      .attr("cx", (d) => xScale(d.stage))
      .attr("stroke-width", 0);

    stageEnter
      .append("text")
      .attr("x", (d) => xScale(d.stage))
      .attr("y", maxRadius + fontHeight)
      .attr("dy", offsets.text)
      .attr("text-anchor", "middle")
      .style("opacity", 0)
      .text((d) => d.stage);

    // TODO Transform the location of the stage node
    // .attr(
    //   "transform",
    //   (d) => `translate(${xScale(d.positionX)},${yScale(d.positionY)})`,
    // )
  };

  /**
   * Updates the stage group elements with transitions and styles based on data.
   *
   * @param {d3.Selection<SVGGElement, any, any, any>} stageSelection - D3 selection of stage groups bound to data.
   */
  const updateStageGroup = (stageSelection) => {
    stageSelection
      // .transition()
      // .delay((d) => d.stage * 40)
      // .duration(transitionDuration)
      .attr("class", (d) => {
        let classes = "stage";
        if (d.raced) classes += " raced";
        if (d.viewing) classes += " viewing";
        return classes;
      });
    // .style("opacity", 1);

    stageSelection
      .select("text")
      .transition()
      .delay((d) => d.stage * 40)
      .duration(transitionDuration)
      .style("opacity", 1);

    stageSelection
      .select("circle")
      .transition()
      .delay((d) => d.stage * 20)
      .duration(transitionDuration)
      .ease(d3.easeQuadInOut)
      .attr("r", (d) => {
        return d.viewing ? 9 : 8;
      })
      .style("opacity", 1);

    // TODO
    // .attr(
    //   "transform",
    //   (d) => `translate(${xScale(d.positionX)},${yScale(d.positionY)})`,
    // )
    // stageSelection
    //   .select("text")
    //   .transition()
    //   .duration(transitionDuration)
    //   .attr("fill", (d) => (d.viewed ? "#000" : "#666"));
  };

  /**
   * Handles the exit selection of stage groups by fading them out and removing from the DOM.
   *
   * @param {d3.Selection<SVGGElement, any, any, any>} stageExit - D3 selection of stage groups to be removed.
   */
  const exitStageGroup = (stageExit) => {
    stageExit
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();
  };

  /**
   * Main stage component function: binds data to selection and manages enter/update/exit.
   *
   * @param {d3.Selection<SVGGElement, unknown, null, undefined>} selection - D3 selection to bind data to.
   * @param {StageDatum[]} data - Array of stage data objects.
   */
  return function stageComponent(selection, data) {
    // Bind data with key function
    const stages = selection.selectAll("g.stage").data(data, (d) => d.stage);

    // Enter
    const stagesEnter = stages.enter().append("g");
    initializeStageGroup(stagesEnter);

    // Merge enter + update
    const stagesMerge = stagesEnter.merge(stages);
    updateStageGroup(stagesMerge);

    // Exit
    exitStageGroup(stages.exit());
  };
}
