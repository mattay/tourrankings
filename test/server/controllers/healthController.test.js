import { describe, it, expect, beforeEach, jest, mock } from "bun:test";
import { getHealth } from "../../../server/controllers/healthController.js";

// Mock the logging module to prevent console errors in tests
mock.module("../../../src/utils/logging.js", () => ({
  logOut: jest.fn(),
  logError: jest.fn(),
}));

describe("Health Controller", () => {
  let req;
  let res;
  let jsonMock;
  let statusMock;

  beforeEach(() => {
    // Reset mocks before each test
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));

    req = {};
    res = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("getHealth", () => {
    it("should return 200 status with healthy status", () => {
      getHealth(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalled();

      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("healthy");
    });

    it("should include timestamp in ISO format", () => {
      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.timestamp).toBeDefined();

      // Verify it's a valid ISO timestamp
      const timestamp = new Date(response.timestamp);
      expect(timestamp.toISOString()).toBe(response.timestamp);
    });

    it("should include process uptime", () => {
      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.uptime).toBeDefined();
      expect(typeof response.uptime).toBe("number");
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });

    it("should include environment from NODE_ENV", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.environment).toBe("production");

      // Restore original value
      process.env.NODE_ENV = originalEnv;
    });

    it("should default to 'development' when NODE_ENV is not set", () => {
      const originalEnv = process.env.NODE_ENV;
      delete process.env.NODE_ENV;

      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.environment).toBe("development");

      // Restore original value
      if (originalEnv !== undefined) {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it("should include version from npm_package_version", () => {
      const originalVersion = process.env.npm_package_version;
      process.env.npm_package_version = "1.2.3";

      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("1.2.3");

      // Restore original value
      if (originalVersion !== undefined) {
        process.env.npm_package_version = originalVersion;
      } else {
        delete process.env.npm_package_version;
      }
    });

    it("should default to 'unknown' version when npm_package_version is not set", () => {
      const originalVersion = process.env.npm_package_version;
      delete process.env.npm_package_version;

      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response.version).toBe("unknown");

      // Restore original value
      if (originalVersion !== undefined) {
        process.env.npm_package_version = originalVersion;
      }
    });

    it("should return all required fields in health response", () => {
      getHealth(req, res);

      const response = jsonMock.mock.calls[0][0];
      expect(response).toHaveProperty("status");
      expect(response).toHaveProperty("timestamp");
      expect(response).toHaveProperty("uptime");
      expect(response).toHaveProperty("environment");
      expect(response).toHaveProperty("version");
    });

    it("should handle errors and return 503 status with unhealthy status", () => {
      // Spy on console.error to verify error is caught
      const originalError = console.error;
      const errorSpy = jest.fn();
      console.error = errorSpy;

      // Mock process.uptime to throw an error
      const originalUptime = process.uptime;
      process.uptime = () => {
        throw new Error("Uptime check failed");
      };

      getHealth(req, res);

      // Should catch the error and return 503
      expect(statusMock).toHaveBeenCalledWith(503);
      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("unhealthy");
      expect(response.error).toBe("Uptime check failed");

      // Restore
      process.uptime = originalUptime;
      console.error = originalError;
    });

    it("should return error details when health check fails", () => {
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

      getHealth(req, errorRes);

      expect(errorRes.status).toHaveBeenCalledWith(503);
      const response = errorJsonMock.mock.calls[0][0];
      expect(response.status).toBe("unhealthy");
      expect(response.error).toBe("Uptime failed");
      expect(response.timestamp).toBeDefined();

      // Restore original function
      process.uptime = originalUptime;
    });

    it("should handle different NODE_ENV values correctly", () => {
      const environments = ["development", "production", "staging", "test"];

      environments.forEach((env) => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = env;

        // Reset mocks
        jsonMock = jest.fn();
        statusMock = jest.fn(() => ({ json: jsonMock }));
        res.status = statusMock;

        getHealth(req, res);

        const response = jsonMock.mock.calls[0][0];
        expect(response.environment).toBe(env);

        // Restore
        process.env.NODE_ENV = originalEnv;
      });
    });

    it("should return timestamp that is recent", () => {
      const beforeCall = new Date();

      getHealth(req, res);

      const afterCall = new Date();
      const response = jsonMock.mock.calls[0][0];
      const responseTime = new Date(response.timestamp);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(
        beforeCall.getTime(),
      );
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it("should handle empty request object", () => {
      const emptyReq = {};

      getHealth(emptyReq, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("healthy");
    });

    it("should handle request with headers", () => {
      req.headers = {
        "user-agent": "test-agent",
        accept: "application/json",
      };

      getHealth(req, res);

      expect(statusMock).toHaveBeenCalledWith(200);
      const response = jsonMock.mock.calls[0][0];
      expect(response.status).toBe("healthy");
    });

    it("should return consistent response structure on multiple calls", () => {
      getHealth(req, res);
      const firstResponse = jsonMock.mock.calls[0][0];
      const firstKeys = Object.keys(firstResponse).sort();

      // Reset mocks
      jsonMock = jest.fn();
      statusMock = jest.fn(() => ({ json: jsonMock }));
      res.status = statusMock;

      getHealth(req, res);
      const secondResponse = jsonMock.mock.calls[0][0];
      const secondKeys = Object.keys(secondResponse).sort();

      expect(firstKeys).toEqual(secondKeys);
    });
  });
});
