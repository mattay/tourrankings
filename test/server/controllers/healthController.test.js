import { describe, it, expect, beforeEach, afterEach, jest, mock } from "bun:test";
import { getHealth } from "@server/controllers/healthController";
import dataService from "@services/dataServiceInstance";
import fsSync from "fs";

// Mock the logging module to prevent console errors in tests
mock.module("@utils/logging", () => ({
  logOut: jest.fn(),
  logError: jest.fn(),
}));

describe("Health Controller", () => {
  let req;
  let res;
  let jsonMock;
  let statusMock;
  let originalIsInitialized;
  let originalDataDir;

  beforeEach(() => {
    // Store original and set default to healthy
    originalIsInitialized = dataService.isInitialized;
    originalDataDir = process.env.DATA_DIR;
    dataService.isInitialized = true;

    // Reset mocks before each test
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };

    // Set DATA_DIR for filesystem check
    process.env.DATA_DIR = process.cwd();
  });

  afterEach(() => {
    // Restore original isInitialized
    dataService.isInitialized = originalIsInitialized;
    // Restore DATA_DIR
    if (originalDataDir !== undefined) {
      process.env.DATA_DIR = originalDataDir;
    } else {
      delete process.env.DATA_DIR;
    }
  });

  describe("getHealth", () => {
    it("should return 200 status with healthy status", async () => {
      await getHealth(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();

      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("healthy");
    });

    it("should include timestamp in ISO format", async () => {
      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();

      // Verify it's a valid ISO timestamp
      const timestamp = new Date(response.timestamp);
      expect(timestamp.toISOString()).toBe(response.timestamp);
    });

    it("should include process uptime", async () => {
      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.uptime).toBeDefined();
      expect(typeof response.uptime).toBe("number");
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include environment from NODE_ENV", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = "production";

        await getHealth(req, res);

        const response = jsonMock.mock.calls[0][0];
        expect(response.environment).toBe("production");
      } finally {
        // Restore original value
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("should default to 'development' when NODE_ENV is not set", async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        delete process.env.NODE_ENV;

        await getHealth(req, res);

        const response = jsonMock.mock.calls[0][0];
        expect(response.environment).toBe("development");
      } finally {
        // Restore original value
        if (originalEnv !== undefined) {
          process.env.NODE_ENV = originalEnv;
        }
      }
    });

it("should include version from APP_VERSION env var", async () => {
      const originalAppVersion = process.env.APP_VERSION;
      process.env.APP_VERSION = "1.2.3";

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("1.2.3");

      if (originalAppVersion !== undefined) {
        process.env.APP_VERSION = originalAppVersion;
      } else {
        delete process.env.APP_VERSION;
      }
    });

    it("should return package version when APP_VERSION unset and package.json readable", async () => {
      const originalAppVersion = process.env.APP_VERSION;
      delete process.env.APP_VERSION;

const readFileSpy = jest.spyOn(fsSync, "readFileSync").mockReturnValue('{"version":"1.0.0"}');

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("1.0.0");

      readFileSpy.mockRestore();
      if (originalAppVersion !== undefined) process.env.APP_VERSION = originalAppVersion;
    });

    it("should return unknown when APP_VERSION unset and package.json read fails", async () => {
      const originalAppVersion = process.env.APP_VERSION;
      delete process.env.APP_VERSION;

      const readFileSpy = jest
        .spyOn(fsSync, "readFileSync")
        .mockImplementation(() => {
          throw new Error("ENOENT");
        });

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("unknown");

      readFileSpy.mockRestore();
      if (originalAppVersion !== undefined) process.env.APP_VERSION = originalAppVersion;
    });

    it("should return package version when APP_VERSION is empty string", async () => {
      const originalAppVersion = process.env.APP_VERSION;
      process.env.APP_VERSION = "";

      const readFileSpy = jest.spyOn(fsSync, "readFileSync").mockReturnValue('{"version":"2.0.0"}');

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("2.0.0");

      readFileSpy.mockRestore();
      if (originalAppVersion !== undefined) {
        process.env.APP_VERSION = originalAppVersion;
      } else {
        delete process.env.APP_VERSION;
      }
    });

    it("should return all required fields in health response", async () => {
      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response).toHaveProperty("status");
      expect(response).toHaveProperty("timestamp");
      expect(response).toHaveProperty("uptime");
      expect(response).toHaveProperty("environment");
      expect(response).toHaveProperty("version");
      expect(response).toHaveProperty("checks");
      expect(response.checks).toHaveProperty("dataService");
    });

    it("should handle errors and return 503 status with unhealthy status", async () => {
      // Mock process.uptime to throw an error
      const originalUptime = process.uptime;
      process.uptime = () => {
        throw new Error("Uptime check failed");
      };

      try {
        await getHealth(req, res);

        // Should catch the error and return 503
        expect(statusMock).toHaveBeenCalledWith(503);
        const response = jsonMock.mock.calls[0][0];
        expect(response.status).toBe("unhealthy");
        expect(response.error).toBe("Uptime check failed");
      } finally {
        // Restore
        process.uptime = originalUptime;
      }
    });

    it("should return error details when health check fails", async () => {
      // Create a mock that fails on json call but succeeds on status
      const errorJsonMock = jest.fn();
      const errorRes = {
        status: jest.fn(() => ({ json: errorJsonMock })),
        json: jest.fn(),
      };

      // Mock process.uptime to throw an error
      const originalUptime = process.uptime;
      process.uptime = () => {
        throw new Error("Uptime failed");
      };

      try {
        await getHealth(req, errorRes);

        expect(errorRes.status).toHaveBeenCalledWith(503);
        const response = errorJsonMock.mock.calls[0][0];
        expect(response.status).toBe("unhealthy");
        expect(response.error).toBe("Uptime failed");
        expect(response.timestamp).toBeDefined();
      } finally {
        // Restore original function
        process.uptime = originalUptime;
      }
    });

    it("should handle different NODE_ENV values correctly", async () => {
      const environments = ["development", "production", "staging", "test"];

      for (const env of environments) {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = env;

        // Reset mocks
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        res.status = statusMock;

        await getHealth(req, res);

        const response = jsonMock.mock.calls[0][0];
        expect(response.environment).toBe(env);

        // Restore
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("should return timestamp that is recent", async () => {
      const beforeCall = new Date();

      await getHealth(req, res);

      const afterCall = new Date();
      const response = jsonMock.mock.calls[0][0];
      const responseTime = new Date(response.timestamp);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime(),
      );
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it("should handle request with headers", async () => {
      req.headers = {
        "user-agent": "test-agent",
        accept: "application/json",
      };

      await getHealth(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("healthy");
    });

    it("should return consistent response structure on multiple calls", async () => {
      await getHealth(req, res);
      const firstResponse = jsonMock.mock.calls[0][0];
      const firstKeys = Object.keys(firstResponse).sort();

      // Reset mocks
      jsonMock = jest.fn();
      statusMock = jest.fn(() => ({ json: jsonMock }));
      res.status = statusMock;

      await getHealth(req, res);
      const secondResponse = jsonMock.mock.calls[0][0];
      const secondKeys = Object.keys(secondResponse).sort();

      expect(firstKeys).toEqual(secondKeys);
    });

    it("should return healthy when dataService is initialized", async () => {
      dataService.isInitialized = true;

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.checks.dataService).toBe("healthy");
      expect(response.status).toBe("healthy");
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should return degraded when dataService is not initialized", async () => {
      dataService.isInitialized = false;

      await getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.checks.dataService).toBe("unhealthy");
      expect(response.status).toBe("degraded");
      expect(statusMock).toHaveBeenCalledWith(503);
    });
  });
});
