/**
 * Measures average character width for a given font config
 * @param {d3.Selection} canvas
 * @param {string[]} groupClassName - CSS font size (e.g., '13px')
 * @param {string} textClassName - CSS font weight (e.g., '400')
 * @param {string} string -
 * @returns {number} Average character width in pixels
 */
export function getStringWidth(canvas, groupClassName, textClassName, string) {
  for (const className of groupClassName) {
    canvas = canvas.append("g").attr("class", className);
  }
  const textEl = canvas
    .append("text")
    .attr("class", textClassName)
    .text(string);
  const width = textEl.node().getBBox().width;

  return width;
}
