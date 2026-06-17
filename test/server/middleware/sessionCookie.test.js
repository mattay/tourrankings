import {
  describe,
  it,
  expect,
  beforeEach,
  jest,
  mock,
} from "bun:test";

/**
 * Creates a fresh session cookie middleware import with the given config.
 *
 * @param {boolean} enabled - Whether session tracking is enabled in config.
 * @returns {Promise<{ default: Function, SESSION_COOKIE_NAME: string }>}
 */
async function loadMiddleware(enabled) {
  mock.module("@server/config", () => ({
    default: {
      env: "test",
      sessionTracking: { enabled },
    },
  }));

  return import("@server/middleware/sessionCookie");
}

/**
 * Creates a mock Express request object for session cookie tests.
 *
 * @param {Object} [cookies={}] - Optional cookies already present on the request.
 * @param {string} [originalUrl="/race/tour-de-france"] - The original URL of the request.
 * @returns {Object} A mock request object with method, URL, cookies, and a get helper.
 */
function createMockReq(cookies = {}, originalUrl = "/race/tour-de-france") {
  return {
    method: "GET",
    originalUrl,
    url: originalUrl,
    cookies,
    get: jest.fn((header) => {
      if (header === "user-agent") return "test-agent";
      return undefined;
    }),
  };
}

/**
 * Creates a mock Express response object for session cookie tests.
 *
 * @returns {{ cookie: import("bun:test").Mock<(...args: any[]) => void> }} A mock response object with a cookie method.
 */
function createMockRes() {
  return {
    cookie: jest.fn(),
  };
}

/**
 * Creates a mock Express next function for session cookie tests.
 *
 * @returns {import("bun:test").Mock<(...args: any[]) => void>} A jest mock function.
 */
function createMockNext() {
  return jest.fn();
}

describe("sessionCookieMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set a session cookie when enabled and no cookie exists", async () => {
    const { default: sessionCookieMiddleware, SESSION_COOKIE_NAME } =
      await loadMiddleware(true);

    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    sessionCookieMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledTimes(1);
    expect(res.cookie.mock.calls[0][0]).toBe(SESSION_COOKIE_NAME);

    const cookieValue = res.cookie.mock.calls[0][1];
    const cookieOptions = res.cookie.mock.calls[0][2];

    expect(typeof cookieValue).toBe("string");
    expect(cookieValue.length).toBeGreaterThan(0);
    expect(req.cookies[SESSION_COOKIE_NAME]).toBe(cookieValue);
    expect(cookieOptions).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  });

  it("should preserve an existing session cookie and not set a new one", async () => {
    const { default: sessionCookieMiddleware, SESSION_COOKIE_NAME } =
      await loadMiddleware(true);

    const existingId = "existing-session-id";
    const req = createMockReq({ [SESSION_COOKIE_NAME]: existingId });
    const res = createMockRes();
    const next = createMockNext();

    sessionCookieMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
    expect(req.cookies[SESSION_COOKIE_NAME]).toBe(existingId);
  });

  it("should not set a cookie when session tracking is disabled", async () => {
    const { default: sessionCookieMiddleware } = await loadMiddleware(false);

    const req = createMockReq();
    const res = createMockRes();
    const next = createMockNext();

    sessionCookieMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it("should not set a cookie for health check requests", async () => {
    const { default: sessionCookieMiddleware } = await loadMiddleware(true);

    const req = createMockReq({}, "/health/memory");
    const res = createMockRes();
    const next = createMockNext();

    sessionCookieMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.cookie).not.toHaveBeenCalled();
  });
});
