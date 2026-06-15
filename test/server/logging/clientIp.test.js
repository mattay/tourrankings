import { describe, it, expect, jest, mock } from "bun:test";
import crypto from "crypto";
import { getClientIp } from "@server/logging/request";

// Mock the file transport to capture log entries without writing files
const mockWrite = jest.fn();
const mockGetTarget = jest.fn(() => "access");

mock.module("@server/logging/transports/file", () => ({
  getFileTransport: jest.fn(() => ({
    write: mockWrite,
    getTarget: mockGetTarget,
    enabled: true,
  })),
  initializeFileTransport: jest.fn(),
}));

describe("getClientIp", () => {
  it("prefers fly-client-ip header", () => {
    const req = {
      ip: "10.0.0.1",
      socket: { remoteAddress: "10.0.0.2" },
      get: (header) =>
        header === "fly-client-ip" ? "203.0.113.5" : undefined,
    };
    expect(getClientIp(req)).toBe("203.0.113.5");
  });

  it("falls back to req.ip", () => {
    const req = {
      ip: "192.168.1.1",
      socket: { remoteAddress: "10.0.0.2" },
      get: () => undefined,
    };
    expect(getClientIp(req)).toBe("192.168.1.1");
  });

  it("falls back to socket remoteAddress", () => {
    const req = {
      ip: undefined,
      socket: { remoteAddress: "10.0.0.2" },
      get: () => undefined,
    };
    expect(getClientIp(req)).toBe("10.0.0.2");
  });

  it("returns unknown when nothing is available", () => {
    const req = {
      ip: undefined,
      socket: undefined,
      get: () => undefined,
    };
    expect(getClientIp(req)).toBe("unknown");
  });
});

describe("logRequest IP handling", () => {
  it("should prefer fly-client-ip header for hashedIp", async () => {
    const { logRequest } = await import("@server/logging/request");

    const req = createMockReq({
      "fly-client-ip": "203.0.113.1",
    });
    req.ip = "10.0.0.1";
    const res = createMockRes();

    logRequest(req, res, 10, 100);

    const entry = mockWrite.mock.calls.at(-1)[1];
    expect(entry.hashedIp).toBe(hash("203.0.113.1"));
  });

  it("should fall back to req.ip when fly-client-ip is absent", async () => {
    const { logRequest } = await import("@server/logging/request");

    const req = createMockReq();
    req.ip = "192.168.1.1";
    const res = createMockRes();

    logRequest(req, res, 10, 100);

    const entry = mockWrite.mock.calls.at(-1)[1];
    expect(entry.hashedIp).toBe(hash("192.168.1.1"));
  });

  it("should fall back to socket remoteAddress", async () => {
    const { logRequest } = await import("@server/logging/request");

    const req = createMockReq();
    req.ip = undefined;
    req.socket = { remoteAddress: "10.0.0.2" };
    const res = createMockRes();

    logRequest(req, res, 10, 100);

    const entry = mockWrite.mock.calls.at(-1)[1];
    expect(entry.hashedIp).toBe(hash("10.0.0.2"));
  });

  it("should hash 'unknown' when no IP source is available", async () => {
    const { logRequest } = await import("@server/logging/request");

    const req = createMockReq();
    req.ip = undefined;
    req.socket = undefined;
    const res = createMockRes();

    logRequest(req, res, 10, 100);

    const entry = mockWrite.mock.calls.at(-1)[1];
    expect(entry.hashedIp).toBe(hash("unknown"));
  });
});

function createMockReq(headers = {}) {
  return {
    method: "GET",
    url: "/",
    originalUrl: "/",
    path: "/",
    id: "test-request-id",
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" },
    get: (header) => {
      if (header === "user-agent") return "test-agent";
      return headers[header];
    },
  };
}

function createMockRes() {
  return {
    statusCode: 200,
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

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
