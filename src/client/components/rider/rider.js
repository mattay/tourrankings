/** <reference types="d3" /> */

/**
 * @typedef {Object} RiderDatum
 * @property {number|string} bib - Unique rider bib number or identifier
 * @property {string} rider - Rider name or label
 * @property {boolean} [raced] - Optional flag if rider has raced
 * @property {boolean} [viewed] - Optional flag if rider has been viewed
 * @property {number} [positionX] - Optional X coordinate for layout
 * @property {number} [positionY] - Optional Y coordinate for layout
 */

/**
 * Options for creating the rider component.
 *
 * @typedef {Object} RiderComponentOptions
 * @property {number} [fontHeight=16] - Font size for rider labels
 * @property {d3.ScaleLinear<number, number>} yScale - D3 linear scale for vertical positioning
 * @property {Object} offsets - Offsets for layout adjustments (e.g., text offset)
 * @property {function(RiderDatum): void} [onRiderClick] - Callback invoked on rider click
 * @property {number} [transitionDuration=750] - Duration for transitions in milliseconds
 */

/**
 * Creates a rider component function that manages data binding, enter/update/exit lifecycle,
 * and renders rider elements with transitions and event handlers.
 *
 * @param {RiderComponentOptions} [options={}] - Configuration options for the component
 * @returns {function(d3.Selection<SVGGElement, unknown, null, undefined>, RiderDatum[]): void}
 *          A function that takes a D3 selection and rider data array to render riders.
 */
export function createRiderComponent({
  fontHeight = 16,
  yScale,
  offsets,
  onRiderClick = () => {},
  transitionDuration = 750,
} = {}) {
  if (!yScale) {
    throw new Error("xScale is required");
  }

  /**
   * Initialize entering rider groups by setting attributes, styles, and appending child elements.
   *
   * @param {d3.Selection<SVGGElement, RiderDatum, any, any>} riderEnter - D3 selection of entering rider groups bound to data.
   */
  const initializeRidersGroup = (riderEnter) => {
    riderEnter
      .attr("class", "rider")
      .style("opacity", 0)
      .on("click", (event, d) => onRiderClick(d));

    riderEnter
      .append("text")
      .attr("x", 0) // TODO: Add x position calculation based on stage
      .attr("y", (y, i) => yScale(i))
      .attr("dy", offsets.text)
      .attr("font-size", fontHeight)
      .text((d) => d.rider);
  };

  /**
   * Update rider groups with transitions and styles.
   *
   * @param {d3.Selection<SVGGElement, RiderDatum, any, any>} riderSelection - D3 selection of rider groups to update.
   */
  const updateRidersGroup = (riderSelection) => {
    riderSelection
      .transition()
      .duration(transitionDuration)
      // .attr(
      //   "transform",
      //   (d) => `translate(${xScale(d.positionX)},${yScale(d.positionY)})`,
      // )
      .style("opacity", 1)
      .attr("class", (d) => {
        let classes = "rider";
        // if (d.raced) classes += " raced";
        // if (d.viewed) classes += " viewed";
        return classes;
      });
  };

  /**
   * Handle exit selection by fading out and removing rider groups.
   *
   * @param {d3.Selection<SVGGElement, RiderDatum, any, any>} riderExit - D3 selection of rider groups to remove.
   */
  const exitRidersGroup = (riderExit) => {
    riderExit
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();
  };

  /**
   * Main rider component function: binds rider data to selection and manages enter/update/exit lifecycle.
   *
   * @param {d3.Selection<SVGGElement, unknown, null, undefined>} selection - D3 selection to bind data to.
   * @param {RiderDatum[]} data - Array of rider data objects.
   */
  return function riderComponent(selection, data) {
    console.log("Rider Component", data);
    // Bind data with key function
    const riders = selection.selectAll("g.rider").data(data, (d) => d.bib);

    // Enter
    const ridersEnter = riders.enter().append("g");
    initializeRidersGroup(ridersEnter);

    // Merge enter + update
    const ridersMerge = ridersEnter.merge(riders);
    updateRidersGroup(ridersMerge);

    // Exit
    exitRidersGroup(riders.exit());
  };
}
