import { describe, test, expect } from "bun:test";
import {
  sprintLocation,
  climbLocation,
} from "@scrappers/source/proCyclingStats/raceStageResults";

describe("sprintLocation", () => {
  const testCasesSprintLocation = [
    // Original patterns
    {
      label: "Sprint | Dozza (108.1 km)",
      expected: {
        location: "Dozza",
        distance: "108.1",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    {
      label: "Sprint | Côte d'Amon (97.5 km)",
      expected: {
        location: "Côte d'Amon",
        distance: "97.5",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    {
      label: "Finish",
      expected: {
        location: "Finish",
        distance: "",
        sprintType: "finish",
        title: "",
      },
    },
    {
      label: "Points at finish",
      expected: {
        location: "Points at finish",
        distance: "",
        sprintType: "finish",
        title: "",
      },
    },
    // Sprint with no pipe
    {
      label: "Sprint (91.9 km)",
      expected: {
        location: "Sprint (91.9 km)",
        distance: "91.9",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    {
      label: "Sprint (158.5 km)",
      expected: {
        location: "Sprint (158.5 km)",
        distance: "158.5",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    {
      label: "Sprint (134.6 km)",
      expected: {
        location: "Sprint (134.6 km)",
        distance: "134.6",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    {
      label: "Sprint (53.6 km)",
      expected: {
        location: "Sprint (53.6 km)",
        distance: "53.6",
        sprintType: "intermediate",
        title: "Sprint",
      },
    },
    // Bonification Sprint patterns
    {
      label: "Bonification Sprint | Irurzun (124.8 km)",
      expected: {
        location: "Irurzun",
        distance: "124.8",
        sprintType: "intermediate",
        title: "Bonification Sprint",
      },
    },
    {
      label: "Bonification Sprint | Altube (93.3 km)",
      expected: {
        location: "Altube",
        distance: "93.3",
        sprintType: "intermediate",
        title: "Bonification Sprint",
      },
    },
    {
      label: "Bonification Sprint | Urrexola (154.3 km)",
      expected: {
        location: "Urrexola",
        distance: "154.3",
        sprintType: "intermediate",
        title: "Bonification Sprint",
      },
    },
    {
      label: "Bonification Sprint | Markina (122.4 km)",
      expected: {
        location: "Markina",
        distance: "122.4",
        sprintType: "intermediate",
        title: "Bonification Sprint",
      },
    },
    {
      label: "Bonification Sprint | Elgoibar (104 km)",
      expected: {
        location: "Elgoibar",
        distance: "104",
        sprintType: "intermediate",
        title: "Bonification Sprint",
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
    // Original patterns
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
    // KOM Sprint with no pipe (has category number and extra closing paren)
    {
      label: "KOM Sprint (3) Willunga 88.8 km)",
      expected: {
        category: "3",
        location: "Willunga",
        distance: "88.8",
        sprintType: "Intermediate",
      },
    },
    // KOM Sprint with pipe but no category number
    {
      label: "KOM Sprint | Castelnuovo Val di Cecina (148.3 km)",
      expected: {
        category: "",
        location: "Castelnuovo Val di Cecina",
        distance: "148.3",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | San Gimignano (206 km)",
      expected: {
        category: "",
        location: "San Gimignano",
        distance: "206",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Ovindoli (36 km)",
      expected: {
        category: "",
        location: "Ovindoli",
        distance: "36",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Todi (81.8 km)",
      expected: {
        category: "",
        location: "Todi",
        distance: "81.8",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Castellalto (164.3 km)",
      expected: {
        category: "",
        location: "Castellalto",
        distance: "164.3",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Tortoreto (Badetta) (200.4 km)",
      expected: {
        category: "",
        location: "Tortoreto (Badetta)",
        distance: "200.4",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Monte della Mattera (138.7 km)",
      expected: {
        category: "",
        location: "Monte della Mattera",
        distance: "138.7",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Santuario Beato Sante (160.8 km)",
      expected: {
        category: "",
        location: "Santuario Beato Sante",
        distance: "160.8",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Santuario Beato Sante (182.4 km)",
      expected: {
        category: "",
        location: "Santuario Beato Sante",
        distance: "182.4",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Camerino (129.5 km)",
      expected: {
        category: "",
        location: "Camerino",
        distance: "129.5",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Camerino (158.6 km)",
      expected: {
        category: "",
        location: "Camerino",
        distance: "158.6",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Camerino (188 km)",
      expected: {
        category: "",
        location: "Camerino",
        distance: "188",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint | Ripatransone (52 km)",
      expected: {
        category: "",
        location: "Ripatransone",
        distance: "52",
        sprintType: "Intermediate",
      },
    },
    // KOM Sprint with letter category (S)
    {
      label: "KOM Sprint (S) Valico delle Capannelle (100.2 km)",
      expected: {
        category: "S",
        location: "Valico delle Capannelle",
        distance: "100.2",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint (S) Sassotetto (65.9 km)",
      expected: {
        category: "S",
        location: "Sassotetto",
        distance: "65.9",
        sprintType: "Intermediate",
      },
    },
    {
      label: "KOM Sprint (S) Monte delle Cesane (90.9 km)",
      expected: {
        category: "S",
        location: "Monte delle Cesane",
        distance: "90.9",
        sprintType: "Intermediate",
      },
    },
  ];

  test.each(testCasesClimbLocation)("parses $label", ({ label, expected }) => {
    const result = climbLocation(label);
    expect(result).toEqual(expected);
  });
});
