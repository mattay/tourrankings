import { expect, test, describe } from "bun:test";
import { generateId } from "@cycling/idGenerator";

describe("generateId.race", () => {
  const testCases = [
    {
      description: "valid race code and year",
      raceCode: "tour-de-france",
      year: 2024,
      expected: "tour-de-france:2024",
    },
    {
      description: "string year",
      raceCode: "giro-d-italia",
      year: "2025",
      expected: "giro-d-italia:2025",
    },
    {
      description: "rejects missing raceCode",
      raceCode: "",
      year: 2024,
      shouldThrow: true,
    },
    {
      description: "rejects missing year",
      raceCode: "tour-de-france",
      year: null,
      shouldThrow: true,
    },
  ];

  test.each(testCases)(
    "handles $description",
    ({ raceCode, year, expected, shouldThrow }) => {
      if (shouldThrow) {
        expect(() => generateId.race(raceCode, year)).toThrow();
      } else {
        expect(generateId.race(raceCode, year)).toBe(expected);
      }
    },
  );
});

describe("generateId.stage", () => {
  const testCases = [
    {
      description: "valid raceUID and stage number",
      raceUID: "tour-de-france:2024",
      stageNumber: 1,
      expected: "tour-de-france:2024:1",
    },
    {
      description: "stage 0 for prologue",
      raceUID: "tour-de-france:2024",
      stageNumber: 0,
      expected: "tour-de-france:2024:0",
    },
    {
      description: "string stage number",
      raceUID: "giro-d-italia:2025",
      stageNumber: "21",
      expected: "giro-d-italia:2025:21",
    },
    {
      description: "rejects missing raceUID",
      raceUID: "",
      stageNumber: 1,
      shouldThrow: true,
    },
    {
      description: "rejects missing stageNumber",
      raceUID: "tour-de-france:2024",
      stageNumber: null,
      shouldThrow: true,
    },
  ];

  test.each(testCases)(
    "handles $description",
    ({ raceUID, stageNumber, expected, shouldThrow }) => {
      if (shouldThrow) {
        expect(() => generateId.stage(raceUID, stageNumber)).toThrow();
      } else {
        expect(generateId.stage(raceUID, stageNumber)).toBe(expected);
      }
    },
  );
});

describe("generateId.location", () => {
  const testCases = [
    {
      description: "valid sprint location",
      stageUID: "tour-de-france:2024:stage-1",
      index: 1,
      locationType: "sprint",
      expected: "tour-de-france:2024:stage-1:sprint:1",
    },
    {
      description: "valid mountain location",
      stageUID: "tour-de-france:2024:stage-1",
      index: 1,
      locationType: "mountain",
      expected: "tour-de-france:2024:stage-1:mountain:1",
    },
    {
      description: "index 0 for first location",
      stageUID: "giro-d-italia:2025:stage-1",
      index: 0,
      locationType: "sprint",
      expected: "giro-d-italia:2025:stage-1:sprint:0",
    },
    {
      description: "string index",
      stageUID: "tour-de-france:2024:stage-1",
      index: "3",
      locationType: "mountain",
      expected: "tour-de-france:2024:stage-1:mountain:3",
    },
    {
      description: "multi-digit index",
      stageUID: "tour-de-france:2024:stage-1",
      index: 10,
      locationType: "sprint",
      expected: "tour-de-france:2024:stage-1:sprint:10",
    },
    {
      description: "rejects missing stageUID",
      stageUID: "",
      index: 1,
      locationType: "sprint",
      shouldThrow: true,
    },
    {
      description: "rejects missing index",
      stageUID: "tour-de-france:2024:stage-1",
      index: null,
      locationType: "sprint",
      shouldThrow: true,
    },
    {
      description: "rejects empty string index",
      stageUID: "tour-de-france:2024:stage-1",
      index: "",
      locationType: "sprint",
      shouldThrow: true,
    },
    {
      description: "rejects missing locationType",
      stageUID: "tour-de-france:2024:stage-1",
      index: 1,
      locationType: "",
      shouldThrow: true,
    },
    {
      description: "rejects missing locationType null",
      stageUID: "tour-de-france:2024:stage-1",
      index: 1,
      locationType: null,
      shouldThrow: true,
    },
  ];

  test.each(testCases)(
    "handles $description",
    ({ stageUID, index, locationType, expected, shouldThrow }) => {
      if (shouldThrow) {
        expect(() => generateId.location(stageUID, index, locationType)).toThrow();
      } else {
        expect(generateId.location(stageUID, index, locationType)).toBe(expected);
      }
    },
  );
});