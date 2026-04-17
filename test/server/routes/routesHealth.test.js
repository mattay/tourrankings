import { describe, it, expect, beforeEach, afterEach, jest, mock } from "bun:test";
import express from "express";

// Mock the logging module
mock.module("@utils/logging", () => ({
  logOut: jest.fn(),
  logError: jest.fn(),
}));

// Mock the dataService
const mockDataService = {
  isInitialized: true,
};

mock.module("@services/dataServiceInstance", () => ({
  default: mockDataService,
}));

describe("Health Routes", () => {
  let app;
  let originalIsInitialized;
  let originalDataDir;

  beforeEach(() => {
    app = express();
    originalIsInitialized = mockDataService.isInitialized;
    originalDataDir = process.env.DATA_DIR;
    mockDataService.isInitialized = true;
    process.env.DATA_DIR = process.cwd();
  });

  afterEach(() => {
    mockDataService.isInitialized = originalIsInitialized;
    if (originalDataDir === undefined || originalDataDir === null) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
  });

  describe("Route Configuration", () => {
    // Focus on exported health router behavior
    it("should register GET / handler", async () => {
      const { routesHealth } = await import("@server/routes");

      // Find the route layer with path "/"
      const healthRoute = routesHealth.stack.find(
        (layer) => layer.route && layer.route.path === "/"
      );

      expect(healthRoute).toBeDefined();
      expect(healthRoute.route.methods.get).toBe(true);
    });
  });

  describe("Health Endpoint Integration", () => {
    it("should be able to mount health controller on a route", async () => {
      // Import the health controller directly
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      // Create a test router with the health endpoint
      const router = express.Router();
      router.get("/health", getHealth);

      app.use(router);

      // Verify the router is created and has the route
      expect(router).toBeDefined();
      const healthRoute = router.stack.find(
        (layer) => layer.route && layer.route.path === "/health"
      );
      expect(healthRoute).toBeDefined();
      expect(healthRoute.route.methods.get).toBe(true);
    });

    it("should handle GET requests to health endpoint", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const router = express.Router();
      router.get("/health", getHealth);
      app.use(router);

      // Create a mock request
      const req = {
        method: "GET",
        path: "/health",
      };

      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      // Call the handler directly
      await getHealth(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.jsonData).toBeDefined();
      expect(res.jsonData.status).toBe("healthy");
    });

    it("should properly wire up health routes with express router", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const router = express.Router();
      router.get("/", getHealth); // Health route at root of /health path

      app.use("/health", router);

      // Verify the router has the health route registered
      const healthLayer = router.stack.find(
        (layer) => layer.route && layer.route.path === "/"
      );
      expect(healthLayer).toBeDefined();
      expect(healthLayer.route.methods.get).toBe(true);
    });

    it("should support middleware chain on health routes", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const router = express.Router();

      // Add a middleware before the health check
      const middleware = (req, res, next) => {
        req.timestamp = Date.now();
        next();
      };

      router.get("/health", middleware, getHealth);
      app.use(router);

      const req = {
        timestamp: null,
      };

      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      const next = () => {};

      // Call middleware
      middleware(req, res, next);
      expect(req.timestamp).toBeDefined();

      // Then call health check
      await getHealth(req, res);
      expect(res.statusCode).toBe(200);
    });
  });

  describe("Route Method Verification", () => {
    it("should only accept GET requests for health endpoint", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const router = express.Router();
      router.get("/health", getHealth);

      // Should not have POST handler
      const postRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.post,
      );
      expect(postRoutes.length).toBe(0);

      // Should have GET handler
      const getRoutes = router.stack.filter(
        (layer) => layer.route && layer.route.methods.get,
      );
      expect(getRoutes.length).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should handle router creation without errors", () => {
      expect(() => {
        const router = express.Router();
        router.get("/health", (req, res) => res.status(200).json({ ok: true }));
      }).not.toThrow();
    });

    it("should handle multiple concurrent requests without state leakage", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const createMockRes = () => ({
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      });

      // Simulate concurrent requests using Promise.all
      const requests = await Promise.all(
        Array.from({ length: 10 }, async () => {
          const req = {};
          const res = createMockRes();
          await getHealth(req, res);
          return res;
        }),
      );

      // All should succeed
      requests.forEach((res) => {
        expect(res.statusCode).toBe(200);
        expect(res.jsonData.status).toBe("healthy");
      });
    });
  });

  describe("Response Format Validation", () => {
    it("should return JSON response from health route", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const req = {};
      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await getHealth(req, res);

      expect(res.jsonData).toBeDefined();
      expect(typeof res.jsonData).toBe("object");
    });

    it("should include standard health check fields", async () => {
      const { getHealth } = await import(
        "@server/controllers/healthController"
      );

      const req = {};
      const res = {
        statusCode: null,
        jsonData: null,
        status: function (code) {
          this.statusCode = code;
          return this;
        },
        json: function (data) {
          this.jsonData = data;
          return this;
        },
      };

      await getHealth(req, res);

      const data = res.jsonData;
      expect(data).toHaveProperty("status");
      expect(data).toHaveProperty("timestamp");
    });
  });
});