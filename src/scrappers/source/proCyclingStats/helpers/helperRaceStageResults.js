import { logError } from "@utils/logging";
import { formatSeconds } from "@utils/time";

/**
 * @typedef {Object} ColumnSchema
 * @property {string[]} [expected] - Column data-code values expected in the HTML table.
 *   If these are missing, the schema check will log an error to notify of a source change.
 * @property {string} [context] - Human-readable description for log messages.
 */

/**
 * Expected column schemas for different classification/table types.
 * Each entry maps a classification name to general and/or today table expected columns.
 * The required data-code values are the column identifiers the parser depends on.
 * If ProCyclingStats changes their HTML structure, missing required columns will
 * trigger error logs to alert the developer immediately.
 */
export const EXPECTED_COLUMN_SCHEMAS = {
  stage: {
    general: {
      expected: [
        "rnk",
        "gc",
        "gc_timelag",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "uci_pnt",
        "time",
        "pnt",
        "bonis",
        "time",
      ],
      context: "Stage result - general table",
    },
  },
  gc: {
    general: {
      expected: [
        "rnk",
        "prev",
        "delta",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "uci_pnt",
        "gc_bonis",
        "time",
        "time_wonlost",
      ],
      context: "GC result - general table",
    },
  },
  points: {
    general: {
      expected: [
        "rnk",
        "prev",
        "delta",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "pnt2",
        "delta_pnt",
      ],
      context: "Points classification - general table",
    },
    today: {
      expected: [
        "rnk",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "pnt",
        "result_boni",
        "delta_pnt",
      ],
      context: "Points classification - today table",
    },
  },
  mountains: {
    general: {
      expected: [
        "rnk",
        "prev",
        "delta",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "pnt2",
        "delta_pnt",
      ],
      context: "Mountains classification - general table",
    },
    today: {
      expected: [
        "rnk",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "pnt",
        "result_boni",
        "delta_pnt",
      ],
      context: "Mountains classification - today table",
    },
  },
  youth: {
    general: {
      expected: [
        "rnk",
        "prev",
        "delta",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "time",
        "time_wonlost",
      ],
      context: "Youth classification - general table",
    },
    today: {
      expected: [
        "rnk",
        "bib",
        "h2h",
        "specialty",
        "age",
        "ridername",
        "teamnamelink",
        "time",
        "time_wonlost",
      ],
      context: "Youth classification - today table",
    },
  },
  teams: {
    general: {
      expected: [
        "rnk",
        "prev",
        "delta",
        "teamline",
        "classification",
        "time",
        "time_wonlost",
      ],
      context: "Teams classification - general table",
    },
    today: {
      expected: ["rnk", "teamline", "classification", "time", "time_wonlost"],
      context: "Teams classification - today table",
    },
  },
};

/**
 * Validates that extracted column headers contain no unexpected data-code values.
 * Logs an error for each column whose key is not in the expected set, alerting
 * the developer when ProCyclingStats adds or renames columns.
 *
 * Does NOT flag missing expected keys — tables legitimately vary between
 * stages and race types (e.g. stage 1 has no prev/delta column).
 *
 * @param {string[]} columns - Extracted column names (from data-code or textContent)
 * @param {ColumnSchema} schema - Schema with the list of known data-code values
 * @returns {boolean} True if all columns are recognised
 */
export function validateTableSchema(columns, schema) {
  if (!schema.expected || schema.expected.length === 0) return true;

  const expectedSet = new Set(schema.expected);
  const unexpected = columns.filter((key) => !expectedSet.has(key));

  if (unexpected.length > 0) {
    logError(
      "PCS Stage Results",
      `[Schema Mismatch] ${schema.context || "Table"}: ` +
        `Unexpected data-code column(s): [${unexpected.join(", ")}].`,
    );
    logError(
      "PCS Stage Results",
      `These are not in the known set for this table type and may indicate ` +
        `ProCyclingStats added or renamed columns.`,
    );
    logError(
      "PCS Stage Results",
      `Update EXPECTED_COLUMN_SCHEMAS and/or tableHeaders() to match. ` +
        `Known columns: [${schema.expected.join(", ")}]. `,
    );
    return false;
  }

  return true;
}

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
      case "previousStageRanking":
      case "gc":
      case "bib":
      case "uci":
      case "points":
      case "deltaPoints":
      case "today":
      // case "change":
      case "position":
        // String to Int
        if (value != "-" && value != "") {
          value = parseInt(value, 10);
        } else if (value == "-" || value == "") {
          value = null;
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
