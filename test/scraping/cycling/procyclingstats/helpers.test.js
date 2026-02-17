import { describe, it, test, expect } from "bun:test";
import { JSDOM } from "jsdom";
import { extractNotice } from "@scrappers/source/proCyclingStats/helpers/helperRaceStageResults";

/**
 * Creates a DOM element from the given HTML string and returns the element matching the given selector.
 * @param {string} html - The HTML string to create the DOM element from.
 * @param {string} selector - The CSS selector to match the element.
 * @returns {Element} The DOM element matching the given selector.
 */
function createNoticeCell(html, selector) {
  const fragment = JSDOM.fragment(html);
  const cell = fragment.querySelector(selector);

  // Add null check to prevent crashes
  if (!cell) throw new Error(`No element found`);

  return cell;
}

const testCasesExtractNotice = [
  {
    html: `<td colspan="13" style="text-align: left; font-size: 10px; color: #999; ">Jasper Philipsen relegated from 2nd to 52nd </td>`,
    selector: "td",
    expected: {
      type: "relegation",
      rider: "Jasper Philipsen",
      from: 2,
      to: 52,
      reason: "",
    },
  },
  {
    html: `<td colspan="13" style="text-align: left; font-size: 10px; color: #999; ">Martin Marcellusi relegated from 8th to 85th  for irregular sprint</td>`,
    selector: "td",
    expected: {
      type: "relegation",
      rider: "Martin Marcellusi",
      from: 8,
      to: 85,
      reason: "irregular sprint",
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
