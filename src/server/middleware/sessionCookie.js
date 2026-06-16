import crypto from "crypto";
import config from "@server/config";

/**
 * Cookie name used for the anonymous session identifier.
 * @type {string}
 */
export const SESSION_COOKIE_NAME = "sid";

/**
 * Options for the session cookie.
 *
 * - `httpOnly`: prevents JavaScript access.
 * - `secure`: only sent over HTTPS.
 * - `sameSite: "lax"`: sent with top-level navigations.
 * - No `maxAge`: session cookie, expires when the browser closes.
 *
 * @type {import("express").CookieOptions}
 */
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
};

/**
 * Generates a new anonymous session identifier.
 *
 * @returns {string} A random UUIDv4 session ID.
 */
export function generateSessionId() {
  return crypto.randomUUID();
}

/**
 * Middleware that sets a session-only anonymous identifier cookie.
 *
 * - Skips health check requests to avoid giving probes cookies.
 * - Only runs when `SESSION_TRACKING_ENABLED` is true.
 * - Assigns the generated ID to `req.cookies.sid` so it is available to
 *   downstream middleware (e.g., request logging) on the same request.
 *
 * @param {import("express").Request} req - Express request object.
 * @param {import("express").Response} res - Express response object.
 * @param {import("express").NextFunction} next - Express next function.
 * @returns {void}
 */
export default function sessionCookieMiddleware(req, res, next) {
  if (!config.sessionTracking.enabled) {
    next();
    return;
  }

  const urlPath = req.originalUrl || req.url || "";
  if (urlPath.startsWith("/health")) {
    next();
    return;
  }

  if (!req.cookies?.[SESSION_COOKIE_NAME]) {
    const sessionId = generateSessionId();

    // Make the ID available on this request for logging.
    req.cookies = req.cookies || {};
    req.cookies[SESSION_COOKIE_NAME] = sessionId;

    res.cookie(SESSION_COOKIE_NAME, sessionId, SESSION_COOKIE_OPTIONS);
  }

  next();
}
