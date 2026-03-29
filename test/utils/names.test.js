import { describe, test, expect } from "bun:test";
import {
  parseName,
  parseTeamName,
} from "@scrappers/source/proCyclingStats/helpers";

const riderNames = [
  {
    input: "GROßSCHARTNER Felix",
    output: {
      success: true,
      values: { surname: "GROßSCHARTNER", firstNames: "Felix" },
    },
  },
  {
    input: "GUIDI Fabrizio",
    output: {
      success: true,
      values: { surname: "GUIDI", firstNames: "Fabrizio" },
    },
  },
  {
    input: "MCCARTY Jonathan Patrick",
    output: {
      success: true,
      values: { surname: "MCCARTY", firstNames: "Jonathan Patrick" },
    },
  },
  {
    input: "VAN OUDENHOVE Gino",
    output: {
      success: true,
      values: { surname: "VAN OUDENHOVE", firstNames: "Gino" },
    },
  },
  {
    input: "GUILLÉ Nicolas",
    output: {
      success: true,
      values: { surname: "GUILLÉ", firstNames: "Nicolas" },
    },
  },
  {
    input: "",
    output: {
      success: false,
      values: { surname: null, firstNames: null },
    },
  },
  {
    input: null,
    output: {
      success: false,
      values: { surname: null, firstNames: null },
    },
  },
  {
    input: undefined,
    output: {
      success: false,
      values: { surname: null, firstNames: null },
    },
  },
];

const teamNames = [
  {
    input: "Israel - Premier Tech (PRT)",
    output: {
      success: true,
      values: { teamName: "Israel - Premier Tech", teamClassification: "PRT" },
    },
  },
  {
    input: "Arkéa - B&B Hotels (WT)",
    output: {
      success: true,
      values: { teamName: "Arkéa - B&B Hotels", teamClassification: "WT" },
    },
  },
  {
    input: "Team Visma | Lease a Bike (WT)",
    output: {
      success: true,
      values: {
        teamName: "Team Visma | Lease a Bike",
        teamClassification: "WT",
      },
    },
  },
  {
    input: "Australia (NAT)",
    output: {
      success: true,
      values: { teamName: "Australia", teamClassification: "NAT" },
    },
  },
  {
    input: "",
    output: {
      success: false,
      values: { teamName: null, teamClassification: null },
    },
  },
  {
    input: null,
    output: {
      success: false,
      values: { teamName: null, teamClassification: null },
    },
  },
  {
    input: undefined,
    output: {
      success: false,
      values: { teamName: null, teamClassification: null },
    },
  },
];

describe("Split rider names", () => {
  test.each(riderNames)("$input", ({ input, output }) => {
    expect(parseName(input)).toEqual(output);
  });
});

describe("Split team and classification", () => {
  test.each(teamNames)("$input", ({ input, output }) => {
    expect(parseTeamName(input)).toEqual(output);
  });
});
