import path from "path";
import crypto from "crypto";
import { getAppVersion } from "@utils/version";
import { getFileTransport } from "@server/logging/transports/file";

/**
 * Static file extensions that map to the static-asset resource type.
 * @type {Set<string>}
 */
const STATIC_EXTENSIONS = new Set([
  ".js",
  ".css",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".map",
]);

/**
 * Resolves process-level metadata once at module load.
 * @returns {Object}
 */
function getProcessMeta() {
  return {
    appVersion: getAppVersion(),
    commitSha: process.env.COMMIT_SHA || "",
    env: process.env.NODE_ENV || "development",
    branchName: process.env.BRANCH_NAME || "",
  };
}

const processMeta = getProcessMeta();

/**
 * Classifies a request URL into a resource type.
 *
 * @param {import('express').Request} req - Express request object
 * @param {number} statusCode - The response status code
 * @returns {'page' | 'api' | 'health' | 'static-asset' | 'unknown'}
 */
export function classifyResourceType(req, statusCode) {
  const urlPath = req.originalUrl || req.url || "";

  if (urlPath.startsWith("/api")) return "api";
  if (urlPath.startsWith("/health")) return "health";

  const ext = path.extname(urlPath.split("?")[0]).toLowerCase();
  if (STATIC_EXTENSIONS.has(ext)) return "static-asset";

  if (statusCode === 404) return "unknown";

  return "page";
}

/**
 * Hashes an IP address using SHA-256 (one-way, GDPR-safe).
 *
 * @param {string} ip - The client IP address
 * @returns {string} Hex-encoded SHA-256 hash
 */
function hashIP(ip) {
  return crypto.createHash("sha256").update(ip).digest("hex");
}

/**
 * Resolves the original client IP address from Fly.io / proxy headers.
 *
 * Prefers Fly.io's `fly-client-ip` header, then falls back to Express's
 * `req.ip` (requires `trust proxy`), then the socket address, then "unknown".
 *
 * @param {import('express').Request} req - Express request object
 * @returns {string}
 */
export function getClientIp(req) {
  return (
    req.get("fly-client-ip") || req.ip || req.socket?.remoteAddress || "unknown"
  );
}

/**
 * Logs an HTTP request by building a complete entry and writing to transports.
 * Fires after the response is sent — never blocks the client.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {number} responseTimeMs - Response time in milliseconds
 * @param {number} responseSizeBytes - Response size in bytes
 * @returns {void}
 */
export function logRequest(req, res, responseTimeMs, responseSizeBytes) {
  const entry = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    url: req.originalUrl || req.url,
    resourceType: classifyResourceType(req, res.statusCode),
    status: res.statusCode,
    responseTimeMs,
    responseSizeBytes,
    referrer: (() => {
      const ref = req.get("referrer");
      if (!ref) return undefined;
      try {
        return new URL(ref).hostname;
      } catch {
        return undefined;
      }
    })(),
    userAgent: req.get("user-agent") || "",
    hashedIp: hashIP(getClientIp(req)),
    ...processMeta,
  };

  const transport = getFileTransport();
  const target = transport.getTarget(entry.resourceType);
  transport.write(target, entry);
}
