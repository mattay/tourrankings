/**
 * Matches a relegation notice
 * @param {string} notice - the notice text
 * @returns {object} - the match groups
 */
const patternRelegation =
  /^(?<rider>.*) relegated from (?<from>\d+)\w{2} to (?<to>\d+)\w{2}(?:\s+for (?<reason>.*)$)?/;

/**
 * Extracts notice information from a table cell.
 *
 * @param {Element} cell - An array of HTML DOM elements representing the table cells.
 * @returns {Object} The notice information.
 */
export function extractNotice(cell) {
  if (cell.children.length > 0) {
    // has at least one child *element*
    return {
      type: "unknown",
      content: cell.outerHTML,
    };
  }

  const notice = cell.textContent.trim();

  if (notice.includes("relegated")) {
    const relegation = notice.match(patternRelegation);
    if (relegation) {
      return {
        type: "relegation",
        rider: relegation.groups.rider,
        from: parseInt(relegation.groups.from),
        to: parseInt(relegation.groups.to),
        reason: relegation.groups.reason || "",
      };
    }
  }

  return {
    type: "unknown",
    content: notice,
  };
}
