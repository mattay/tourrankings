import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { rmSync, mkdtempSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { RaceRiders } from "@models/raceRiders";

/**
 * @typedef {import('@models/@types/races').RaceRiderModel} RaceRiderModel
 */

describe("RaceRiders model", () => {
  let originalDataDir;
  let tempDir;

  beforeEach(() => {
    originalDataDir = process.env.DATA_DIR;
    tempDir = mkdtempSync(join(tmpdir(), "raceRiders-test-"));
    process.env.DATA_DIR = tempDir;
  });

  afterEach(() => {
    if (originalDataDir === undefined) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
    rmSync(tempDir, { recursive: true, force: true });
  });

  test("persists riders with null bib numbers", async () => {
    const raceRiders = new RaceRiders();

    /** @type {RaceRiderModel[]} */
    const updates = [
      {
        raceUID: "tour-de-france:2026",
        bib: null,
        riderPcsId: "paul-seixas",
        teamPcsId: "decathlon-cma-cgm-team-2026",
        rider: "Paul SEIXAS",
        firstNames: "Paul",
        surname: "SEIXAS",
        flag: "fr",
      },
      {
        raceUID: "tour-de-france:2026",
        bib: 51,
        riderPcsId: "some-rider",
        teamPcsId: "decathlon-cma-cgm-team-2026",
        rider: "Some Rider",
        firstNames: "Some",
        surname: "Rider",
        flag: "fr",
      },
    ];

    await raceRiders.update(updates);

    expect(raceRiders.rows).toHaveLength(2);
    expect(
      raceRiders.rows.find((r) => r.riderPcsId === "paul-seixas"),
    ).toBeDefined();

    const csvContent = readFileSync(join(tempDir, "raceRiders.csv"), "utf-8");
    const lines = csvContent.trim().split("\n");
    expect(lines.length).toBe(3); // header + 2 riders
    expect(lines[1]).toContain("paul-seixas");
  });

});
