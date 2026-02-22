import { describe, it, expect } from "bun:test";
import {
  parseName,
  parseTeamName,
} from "@scrappers/source/proCyclingStats/helpers";

describe("Splitting Names", () => {
  it("Should slit Uppercase surnames and lowercase firstnames", () => {
    expect(parseName("GROßSCHARTNER Felix")).toEqual({
      success: true,
      values: { surname: "GROßSCHARTNER", firstNames: "Felix" },
    });
    expect(parseName("GUIDI Fabrizio")).toEqual({
      success: true,
      values: { surname: "GUIDI", firstNames: "Fabrizio" },
    });
    expect(parseName("MCCARTY Jonathan Patrick")).toEqual({
      success: true,
      values: { surname: "MCCARTY", firstNames: "Jonathan Patrick" },
    });
    expect(parseName("VAN OUDENHOVE Gino")).toEqual({
      success: true,
      values: { surname: "VAN OUDENHOVE", firstNames: "Gino" },
    });
    expect(parseName("GUILLÉ Nicolas")).toEqual({
      success: true,
      values: { surname: "GUILLÉ", firstNames: "Nicolas" },
    });
    expect(parseName("")).toEqual({
      success: false,
      values: { surname: null, firstNames: null },
    });
  });
});

describe("Splitting Team Titles", () => {
  it("Should slit team and classification", () => {
    expect(parseTeamName("Israel - Premier Tech (PRT)")).toEqual({
      success: true,
      values: { teamName: "Israel - Premier Tech", teamClassification: "PRT" },
    });
    expect(parseTeamName("Arkéa - B&B Hotels (WT)")).toEqual({
      success: true,
      values: { teamName: "Arkéa - B&B Hotels", teamClassification: "WT" },
    });
    expect(parseTeamName("Team Visma | Lease a Bike (WT)")).toEqual({
      success: true,
      values: {
        teamName: "Team Visma | Lease a Bike",
        teamClassification: "WT",
      },
    });
    expect(parseTeamName("Australia (NAT)")).toEqual({
      success: true,
      values: { teamName: "Australia", teamClassification: "NAT" },
    });
    expect(parseTeamName("")).toEqual({
      success: false,
      values: { teamName: null, teamClassification: null },
    });
  });
});
