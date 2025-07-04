import { describe, it, expect } from "bun:test";
import { toCamelCase, toTitleCase } from "../src/utils/string.js";
import { stringToSeconds, formatSeconds } from "../src/utils/time.js";

describe("String utilities", () => {
  it("should convert string to camelCase", () => {
    expect(toCamelCase("hello world")).toBe("helloWorld");
    expect(toCamelCase("test_string")).toBe("testString");
  });

  it("should convert first character to uppercase", () => {
    expect(toTitleCase("hello")).toBe("Hello");
    expect(toTitleCase("test")).toBe("Test");
  });
});

describe("Time utilities", () => {
  it("should convert time string to seconds", () => {
    expect(stringToSeconds("01:30:45")).toBe(5445);
    expect(stringToSeconds("00:05:30")).toBe(330);
  });
});
