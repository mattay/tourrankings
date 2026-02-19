import { formatSeconds } from "@utils/time";

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
        riderName: relegation.groups.rider,
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

/**
 *
 * @param {Object} a
 * @param {Object} b
 * @returns
 */
export function sortByRanking(a, b) {
  const aRnk = parseInt(a.rnk);
  const bRnk = parseInt(b.rnk);
  if (isNaN(aRnk) && isNaN(bRnk)) return 0;
  if (isNaN(aRnk)) return 1;
  if (isNaN(bRnk)) return -1;
  return aRnk - bRnk;
}

/**
 *
 * @param {Object} row
 * @param {Array} columnsToDrop
 * @returns
 */
export function dropColumns(row, columnsToDrop) {
  for (const column of columnsToDrop) {
    if (Object.hasOwn(row, column)) {
      delete row[column];
    }
  }
  return row;
}

/**
 * @param {Object} row
 * @returns
 */
export function formatRow(row) {
  const formattedCells = {};

  // Format values
  for (let key of Object.keys(row)) {
    let value = row[key];
    switch (key) {
      case "stage":
      case "rank":
      case "previous stage ranking":
      case "gc":
      case "bib":
      case "uci":
      case "points":
      case "today":
      case "change":
      case "position":
        // String to Int
        if (value != "-" && value != "") {
          value = parseInt(value, 10);
        } else if (value == "-") {
          value = "";
        }
        break;
      case "time":
      case "delta":
        // Int to Time string
        if (value > 0) {
          value = formatSeconds(value);
        } else {
          value = "";
        }
        break;
      default:
        break;
    }
    formattedCells[key] = value;
  }

  return formattedCells;
}
