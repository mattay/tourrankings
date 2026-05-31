import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
  mock,
} from "bun:test";
import { classifyResourceType } from "@server/logging/request";

// Mock the file transport to capture target routing without writing files
const mockWrite = jest.fn();
const mockGetTarget = jest.fn((resourceType) => {
  switch (resourceType) {
    case "api":
      return "api";
    case "health":
      return "health";
    case "static-asset":
      return "static";
    default:
      return "access";
  }
});

mock.module("@server/logging/transports/file", () => ({
  getFileTransport: jest.fn(() => ({
    write: mockWrite,
    getTarget: mockGetTarget,
    enabled: true,
  })),
  initializeFileTransport: jest.fn(),
}));

describe("Request Logging Classification", () => {
  let originalDataDir;

  beforeEach(() => {
    originalDataDir = process.env.DATA_DIR;
    process.env.DATA_DIR = process.cwd();
    mockWrite.mockClear();
    mockGetTarget.mockClear();
  });

  afterEach(() => {
    if (originalDataDir === undefined || originalDataDir === null) {
      delete process.env.DATA_DIR;
    } else {
      process.env.DATA_DIR = originalDataDir;
    }
  });

  describe("classifyResourceType", () => {
    it("should classify /health as health", () => {
      const req = { originalUrl: "/health" };
      expect(classifyResourceType(req, 200)).toBe("health");
    });

    it("should classify /health?check=true as health", () => {
      const req = { originalUrl: "/health?check=true" };
      expect(classifyResourceType(req, 200)).toBe("health");
    });

    it("should classify /api/race as api", () => {
      const req = { originalUrl: "/api/race" };
      expect(classifyResourceType(req, 200)).toBe("api");
    });

    it("should classify /api/feedback as api", () => {
      const req = { originalUrl: "/api/feedback" };
      expect(classifyResourceType(req, 200)).toBe("api");
    });

    it("should classify /static/app.js as static-asset", () => {
      const req = { originalUrl: "/static/app.js" };
      expect(classifyResourceType(req, 200)).toBe("static-asset");
    });

    it("should classify /styles/main.css as static-asset", () => {
      const req = { originalUrl: "/styles/main.css" };
      expect(classifyResourceType(req, 200)).toBe("static-asset");
    });

    it("should classify /favicon.ico as static-asset", () => {
      const req = { originalUrl: "/favicon.ico" };
      expect(classifyResourceType(req, 200)).toBe("static-asset");
    });

    it("should classify / as page", () => {
      const req = { originalUrl: "/" };
      expect(classifyResourceType(req, 200)).toBe("page");
    });

    it("should classify /season/2025 as page", () => {
      const req = { originalUrl: "/season/2025" };
      expect(classifyResourceType(req, 200)).toBe("page");
    });

    it("should classify /race/tour-de-france as page", () => {
      const req = { originalUrl: "/race/tour-de-france" };
      expect(classifyResourceType(req, 200)).toBe("page");
    });

    it("should classify 404 as unknown", () => {
      const req = { originalUrl: "/nonexistent" };
      expect(classifyResourceType(req, 404)).toBe("unknown");
    });

    it("should use req.url when req.originalUrl is not set", () => {
      const req = { url: "/health" };
      expect(classifyResourceType(req, 200)).toBe("health");
    });

    it("should default to page when neither originalUrl nor url is set", () => {
      const req = {};
      expect(classifyResourceType(req, 200)).toBe("page");
    });
  });

  describe("logRequest integration", () => {
    it("should route /health requests to health target", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/health", "/health", 200);
      const res = createMockRes(200);

      logRequest(req, res, 10, 100);

      const lastTarget = mockGetTarget.mock.calls.at(-1)[0];
      expect(lastTarget).toBe("health");
    });

    it("should route /api requests to api target", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/api/race", "/api/race", 200);
      const res = createMockRes(200);

      logRequest(req, res, 15, 200);

      const lastTarget = mockGetTarget.mock.calls.at(-1)[0];
      expect(lastTarget).toBe("api");
    });

    it("should route page requests to access target", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/", "/", 200);
      const res = createMockRes(200);

      logRequest(req, res, 50, 5000);

      const lastTarget = mockGetTarget.mock.calls.at(-1)[0];
      expect(lastTarget).toBe("page");
    });

    it("should route static asset requests to static target", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/static/app.js", "/static/app.js", 200);
      const res = createMockRes(200);

      logRequest(req, res, 5, 10000);

      const lastTarget = mockGetTarget.mock.calls.at(-1)[0];
      expect(lastTarget).toBe("static-asset");
    });

    it("should route 404 requests to access target", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/nonexistent", "/nonexistent", 404);
      const res = createMockRes(404);

      logRequest(req, res, 2, 100);

      const lastTarget = mockGetTarget.mock.calls.at(-1)[0];
      expect(lastTarget).toBe("unknown");
    });

    it("should include process metadata in the entry", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/", "/", 200);
      const res = createMockRes(200);

      logRequest(req, res, 10, 100);

      const lastWrite = mockWrite.mock.calls.at(-1);
      const entry = lastWrite[1];

      expect(entry).toHaveProperty("appVersion");
      expect(entry).toHaveProperty("commitSha");
      expect(entry).toHaveProperty("env");
      expect(entry).toHaveProperty("branchName");
    });

    it("should include request details in the entry", async () => {
      const { logRequest } = await import("@server/logging/request");

      const req = createMockReq("/api/race", "/api/race", 200);
      const res = createMockRes(200);

      logRequest(req, res, 10, 100);

      const lastWrite = mockWrite.mock.calls.at(-1);
      const entry = lastWrite[1];

      expect(entry.method).toBe("GET");
      expect(entry.url).toBe("/api/race");
      expect(entry.status).toBe(200);
      expect(entry.responseTimeMs).toBe(10);
      expect(entry.responseSizeBytes).toBe(100);
      expect(entry.requestId).toBe("test-request-id");
      expect(entry.hashedIp).toBeDefined();
      expect(entry.userAgent).toBe("test-agent");
    });
  });
});

function createMockReq(originalUrl, url, statusCode) {
  return {
    method: "GET",
    url,
    originalUrl,
    path: url,
    id: "test-request-id",
    ip: "127.0.0.1",
    get: (header) => {
      if (header === "user-agent") return "test-agent";
      if (header === "referrer") return undefined;
      return undefined;
    },
  };
}

function createMockRes(statusCode) {
  return {
    statusCode,
    socket: { bytesWritten: 100 },
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function () {
      return this;
    },
    send: function () {
      return this;
    },
    on: function (event, callback) {
      if (event === "finish") callback();
    },
  };
}
