import { describe, test, expect } from "bun:test";
import {
  parseName,
  parseTeamName,
} from "@scrappers/source/proCyclingStats/helpers";

const riderNames = [
  {
    input: undefined,
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
    input: "",
    output: {
      success: false,
      values: { surname: null, firstNames: null },
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
    input: "GUILLÉ Nicolas",
    output: {
      success: true,
      values: { surname: "GUILLÉ", firstNames: "Nicolas" },
    },
  },
  {
    input: "GROßSCHARTNER Felix",
    output: {
      success: true,
      values: { surname: "GROßSCHARTNER", firstNames: "Felix" },
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
    input: "O'CONNOR Ben",
    output: {
      success: true,
      values: { surname: "O'CONNOR", firstNames: "Ben" },
    },
  },
  {
    input: "PARET-PEINTRE Valentin",
    output: {
      success: true,
      values: { surname: "PARET-PEINTRE", firstNames: "Valentin" },
    },
  },
  {
    input: "ROGLIČ Primož",
    output: {
      success: true,
      values: { surname: "ROGLIČ", firstNames: "Primož" },
    },
  },
  {
    input: "SKUJIŅŠ Toms",
    output: {
      success: true,
      values: { surname: "SKUJIŅŠ", firstNames: "Toms" },
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
    input: "ØRN-KRISTOFF Felix",
    output: {
      success: true,
      values: { surname: "ØRN-KRISTOFF", firstNames: "Felix" },
    },
  },
];

const teamNames = [
  {
    input: undefined,
    output: {
      success: false,
      values: { name: null, classification: null },
    },
  },
  {
    input: null,
    output: {
      success: false,
      values: { name: null, classification: null },
    },
  },
  {
    input: "",
    output: {
      success: false,
      values: { name: null, classification: null },
    },
  },
  {
    input: "Arkéa - B&B Hotels (WT)",
    output: {
      success: true,
      values: { name: "Arkéa - B&B Hotels", classification: "WT" },
    },
  },
  {
    input: "Australia (NAT)",
    output: {
      success: true,
      values: { name: "Australia", classification: "NAT" },
    },
  },
  {
    input: "Israel - Premier Tech (PRT)",
    output: {
      success: true,
      values: { name: "Israel - Premier Tech", classification: "PRT" },
    },
  },

  {
    input: "Team Visma | Lease a Bike (WT)",
    output: {
      success: true,
      values: {
        name: "Team Visma | Lease a Bike",
        classification: "WT",
      },
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
