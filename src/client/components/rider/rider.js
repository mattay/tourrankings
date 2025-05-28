/** <reference types="d3" /> */

/** @typedef {import('../../state/selectors/@types/riders').FilteredStageRider} RiderDatum */

/**
 * Options for creating the rider component.
 *
 * @typedef {Object} RiderComponentOptions
 * @property {number} [fontHeight=16] - Font size for rider labels
 * @property {d3.ScaleLinear<number, number>} xScale - D3 linear scale for horizontal positioning
 * @property {d3.ScaleLinear<number, number>} yScale - D3 linear scale for vertical positioning
 * @property {Object} offsets - Offsets for layout adjustments (e.g., text offset)
 * @property {number} stage - Font size for rider labels
 * @property {function(RiderDatum): void} [onRiderClick] - Callback invoked on rider click
 * @property {number} [transitionDuration=750] - Duration for transitions in milliseconds
 */

/**
 * Creates a rider component function that manages data binding, enter/update/exit lifecycle,
 * and renders rider elements with transitions and event handlers.
 *
 * @param {RiderComponentOptions} options - Configuration options for the component
 * @returns {function(d3.Selection<SVGElement, unknown, null, undefined>, RiderDatum[]): void}
 *          A function that takes a D3 selection and rider data array to render riders.
 */
export function createRiderComponent({
  fontHeight = 16,
  xScale,
  yScale,
  offsets,
  stage,
  onRiderClick = () => {},
  transitionDuration = 840,
}) {
  if (!xScale) throw new Error("xScale is required");
  if (!yScale) throw new Error("yScale is required");

  /**
   * Initialize entering rider groups by setting attributes, styles, and appending child elements.
   *
   * @param {d3.Selection<SVGGElement, RiderDatum, any, any>} riderEnter - D3 selection of entering rider groups bound to data.
   */
  const initializeRidersGroup = (riderEnter) => {
    riderEnter
      .attr("class", "rider")
      .style("opacity", 0)
      .attr(
        "transform",
        (d, i) =>
          `translate(${xScale(d.lastStage) + offsets.text}, ${yScale(d.stageRankings.result)})`,
      )
      .on("click", (event, d) => onRiderClick(d));

    riderEnter
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("dy", offsets.text)
      .attr("font-size", 0)
      .attr("fill", "none")
      .text((d) => d.rider);
  };

  /**
   * Update rider groups with transitions and styles.
   *
   * @param {d3.Selection<SVGElement, RiderDatum, any, any>} riderSelection - D3 selection of rider groups to update.
   */
  const updateRidersGroup = (riderSelection) => {
    riderSelection
      .transition()
      .delay((d, i) => 420 + d.stageRankings.result * 5)
      .duration(transitionDuration)
      .ease(d3.easeQuadInOut)
      .attr("transform", (d, i) => {
        if (isNaN(d.stageRankings.result)) {
          console.log(d);
        }
        return `translate(${xScale(d.lastStage) + offsets.text}, ${yScale(d.stageRankings.result)})`;
      })
      .style("opacity", 1)
      .attr("class", (d) => {
        let classes = "rider";
        if (d.abandoned) classes += " abandoned";
        return classes;
      });

    riderSelection
      .select("text")
      .transition()
      .delay((d, i) => 420 + i * 10)
      .duration(transitionDuration)
      .ease(d3.easeQuadInOut);
  };

  /**
   * Handle exit selection by fading out and removing rider groups.
   *
   * @param {d3.Selection<SVGElement, RiderDatum, any, any>} riderExit - D3 selection of rider groups to remove.
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
   * @param {d3.Selection<SVGElement, unknown, null, undefined>} selection - D3 selection to bind data to.
   * @param {RiderDatum[]} data - Array of rider data objects.
   */
  return function riderComponent(selection, data) {
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
