import { describe, it, expect } from "bun:test";
import { toCamelCase, toTitleCase } from "../src/utils/string.js";
import { stringToSeconds, formatSeconds } from "../src/utils/time.js";

describe("String utilities", () => {
  it("should convert string to camelCase", () => {
    expect(toCamelCase("hello world")).toBe("helloWorld");
    expect(toCamelCase("test_string")).toBe("testString");
    expect(toCamelCase("HELLO WORLD")).toBe("helloWorld");
    expect(toCamelCase("test-string")).toBe("testString");
    expect(toCamelCase("")).toBe("");
  });

  it("should convert first character to uppercase", () => {
    expect(toTitleCase("hello")).toBe("Hello");
    expect(toTitleCase("test")).toBe("Test");
    expect(toTitleCase("")).toBe("");
    expect(toTitleCase("A")).toBe("A");
  });
});

describe("Time utilities", () => {
  it("should convert time string to seconds", () => {
    expect(stringToSeconds("01:30:45")).toBe(5445);
    expect(stringToSeconds("00:05:30")).toBe(330);
    expect(stringToSeconds("00:00:01")).toBe(1);
    expect(stringToSeconds("10:00:00")).toBe(36000);
  });
});
