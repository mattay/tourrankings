import { describe, test, expect } from "bun:test";
import { parse } from "node-html-parser";
import { extractNotice } from "@scrappers/source/proCyclingStats/helpers/helperRaceStageResults";
import {
  sprintLocation,
  climbLocation,
} from "@scrappers/source/proCyclingStats/raceStageResults";

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

describe("sprintLocation", () => {
  const testCasesSprintLocation = [
    {
      label: "Sprint | Dozza (108.1 km)",
      expected: {
        location: "Dozza",
        distance: "108.1",
        sprintType: "intermediate",
      },
    },
    {
      label: "Sprint | Côte d'Amon (97.5 km)",
      expected: {
        location: "Côte d'Amon",
        distance: "97.5",
        sprintType: "intermediate",
      },
    },
    {
      label: "Finish",
      expected: {
        location: "Finish",
        distance: "",
        sprintType: "finish",
      },
    },
  ];

  test.each(testCasesSprintLocation)("parses $label", ({ label, expected }) => {
    const result = sprintLocation(label);
    expect(result).toEqual(expected);
  });
});

describe("climbLocation", () => {
  const testCasesClimbLocation = [
    {
      label: "KOM Sprint (3) Côte de San Luca (186.6 km)",
      expected: {
        category: "3",
        location: "Côte de San Luca",
        distance: "186.6",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint (HC) Col du Galibier (261.5 km)",
      expected: {
        category: "HC",
        location: "Col du Galibier",
        distance: "261.5",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint (1) Alpe d'Huez (180 km)",
      expected: {
        category: "1",
        location: "Alpe d'Huez",
        distance: "180",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint (2) Mont Ventoux (145 km)",
      expected: {
        category: "2",
        location: "Mont Ventoux",
        distance: "145",
        sprintType: "Intermediate",
      },
    },
  ];

  test.each(testCasesClimbLocation)("parses $label", ({ label, expected }) => {
    const result = climbLocation(label);
    expect(result).toEqual(expected);
  });
});
