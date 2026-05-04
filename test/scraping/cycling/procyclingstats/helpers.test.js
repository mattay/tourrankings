import { describe, test, expect } from "bun:test";
import { parse } from "node-html-parser";
import { extractNotice } from "@scrappers/source/proCyclingStats/helpers/helperRaceStageResults";

/**
 * Creates a DOM element from the given HTML string and returns the element matching the given selector.
 * @param {string} html - The HTML string to create the DOM element from.
 * @param {string} selector - The CSS selector to match the element.
 * @returns {Element} The DOM element matching the given selector.
 */
function createNoticeCell(html, selector) {
  const root = parse(html);
  const cell = root.querySelector(selector);

  // Add null check to prevent crashes
  if (!cell) throw new Error(`No element found for selector "${selector}"`);

  return cell;
}

const testCasesExtractNotice = [
  {
    html: `<td>Jasper Philipsen relegated from 2nd to 52nd </td>`,
    selector: "td",
    expected: {
      type: "relegation",
      riderName: "Jasper Philipsen",
      from: 2,
      to: 52,
      reason: "",
    },
  },
  {
    html: `<td>Martin Marcellusi relegated from 8th to 85th  for irregular sprint</td>`,
    selector: "td",
    expected: {
      type: "relegation",
      riderName: "Martin Marcellusi",
      from: 8,
      to: 85,
      reason: "irregular sprint",
    },
  },
  {
    html: `<td><span>some child element</span></td>`,
    selector: "td",
    expected: {
      type: "unknown",
      content: `<td><span>some child element</span></td>`,
    },
  },
  {
    html: `<td>Some unrecognised notice text</td>`,
    selector: "td",
    expected: {
      type: "unknown",
      content: "Some unrecognised notice text",
    },
  },
];

describe("extractNotice", () => {
  test.each(testCasesExtractNotice)(
    "handles $html",
    ({ html, selector, expected }) => {
      const cell = createNoticeCell(html, selector);
      const result = extractNotice(cell);
      expect(result).toEqual(expected);
    },
  );
});
=======
});
>>>>>>> a421dec (refactor: move location parsing tests to dedicated file)
