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
    // .curve(d3.curveMonotoneX)
    .curve(d3.curveBumpX)
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
    const firstPoint = d.length > 0 ? d[0].stage : 0;
    const lastPoint = d.length > 0 ? d[d.length - 1].stage : 0;
    const steps = Math.max(0, lastPoint - firstPoint);

    line
      .attr("stroke-dasharray", oldLength + " " + greatestLength)
      .transition()
      .ease(d3.easeCubicOut)
      .delay(transitionDuration)
      .duration(steps * transitionDuration)
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
      .attr("data-id", (d, i) => {
        return d[0]?.bib || d[0]?.team || i;
      })
      .on("click", (event, d) => onRiderClick(d));

    rankingEnter
      .append("path")
      .attr("class", "background")
      .attr("d", "M0,0 L0,0");

    rankingEnter
      .append("path")
      .attr("class", "foreground")
      .attr("d", "M0,0 L0,0");

    rankingEnter
      .append("circle")
      .attr("class", "dot")
      .attr("r", 0)
      .attr("cx", (d) => (d.length >= 1 ? xScale(d[0].stage) : 0))
      .attr("cy", (d) => (d.length >= 1 ? yScale(d[0].rank) : 0));
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

    rankingSelection
      .select(".dot")
      .transition()
      .ease(d3.easeQuadInOut)
      .duration(transitionDuration)
      .attr("cx", (d) => (d.length >= 1 ? xScale(d[0].stage) : 0))
      .attr("cy", (d) => (d.length >= 1 ? yScale(d[0].rank) : 0))
      .attr("r", (d) => (d.length >= 1 ? 4 : 0));
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
    console.log("rankingComponent", data);
    // Bind data with key function
    const rankings = selection.selectAll("g.ranking").data(data, (d, i) => {
      return d[0]?.bib || d[0]?.team || i;
    });

    // Exit
    exitRankingGroup(rankings.exit());

    // Update existing
    // updateRankingGroup(rankings);

    // Enter
    const rankingsEnter = rankings.enter().append("g");
    initializeRankingGroup(rankingsEnter);

    // Merge enter + update
    const rankingsMerge = rankingsEnter.merge(rankings);
    updateRankingGroup(rankingsMerge);
  };
}
