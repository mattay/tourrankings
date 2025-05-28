/**
 * Options for creating the rider ranking component.
 *
 * @typedef {Object} RiderComponentOptions
 * @property {d3.ScaleLinear<number, number>} xScale - D3 linear scale for horizontal positioning
 * @property {d3.ScaleLinear<number, number>} yScale - D3 linear scale for vertical positioning
 * @property {Object} offsets - Offsets for layout adjustments (e.g., text offset)
 * @property {number} stage - Font size for rider labels
 * @property {function(RankingDatum): void} [onRiderClick] - Callback invoked on rider click
 * @property {number} [transitionDuration=750] - Duration for transitions in milliseconds
 */

/**
 * Creates a rider component function that manages data binding, enter/update/exit lifecycle,
 * and renders rider elements with transitions and event handlers.
 *
 * @param {RiderComponentOptions} options - Configuration options for the component
 * @returns {function(d3.Selection<SVGElement, unknown, null, undefined>, RankingDatum[]): void}
 *          A function that takes a D3 selection and rider data array to render riders.
 */
export function createRankingComponent({
  xScale,
  yScale,
  offsets,
  stage,
  onRiderClick = () => {},
  transitionDuration = 840,
}) {
  if (!xScale) throw new Error("xScale is required");
  if (!yScale) throw new Error("yScale is required");

  const createLine = d3
    .line()
    .curve(d3.curveMonotoneX)
    .x((d) => xScale(d.stage))
    .y((d) => yScale(d.rank));

  const path = (d) => {
    if (!d) return null;
    const validData = d.filter((item) => item != null);
    return validData.length >= 2 ? createLine(validData) : null;
  };

  const animatePath = (element, d) => {
    const line = d3.select(element);
    const oldLength = element.getTotalLength();
    line.attr("d", path(d));
    const newLength = element.getTotalLength();
    const greatestLength = oldLength > newLength ? oldLength : newLength;

    line
      .attr("stroke-dasharray", oldLength + " " + greatestLength)
      .transition()
      .duration(3000)
      .attr("stroke-dasharray", newLength + " " + newLength);
  };

  /**
   * Initialize entering rider groups by setting attributes, styles, and appending child elements.
   *
   * @param {d3.Selection<SVGGElement, RankingDatum, any, any>} rankingEnter - D3 selection of entering rider groups bound to data.
   */
  const initializeRankingGroup = (rankingEnter) => {
    console.log("[initializeRankingGroup]", rankingEnter);

    rankingEnter
      .attr("class", "ranking")
      .on("click", (event, d) => onRiderClick(d));

    rankingEnter
      .append("path")
      .attr("class", "background")
      .attr("d", "M0,0 L0,0");

    rankingEnter
      .append("path")
      .attr("class", "foreground")
      .attr("d", "M0,0 L0,0");
  };

  /**
   * Update rider groups with transitions and styles.
   *
   * @param {d3.Selection<SVGElement, RankingDatum, any, any>} rankingSelection - D3 selection of rider groups to update.
   */
  const updateRankingGroup = (rankingSelection) => {
    rankingSelection.select(".background").each(function (d) {
      animatePath(this, d);
    });
    rankingSelection.select(".foreground").each(function (d) {
      animatePath(this, d);
    });
  };

  /**
   * Handle exit selection by fading out and removing rider groups.
   *
   * @param {d3.Selection<SVGElement, RankingDatum, any, any>} rankingExit - D3 selection of rider groups to remove.
   */
  const exitRankingGroup = (rankingExit) => {
    rankingExit
      .transition()
      .duration(transitionDuration)
      .style("opacity", 0)
      .remove();
  };

  return function rankingComponent(selection, data) {
    // Bind data with key function
    const rankings = selection.selectAll("g.ranking").data(data, (d, i) => i);

    // Enter
    const rankingsEnter = rankings.enter().append("g");
    initializeRankingGroup(rankingsEnter);

    // Merge enter + update
    const rankingsMerge = rankingsEnter.merge(rankings);
    updateRankingGroup(rankingsMerge);

    // Exit
    exitRankingGroup(rankings.exit());
  };
}
