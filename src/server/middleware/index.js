import express from "express";
import compression from "compression";
import crypto from "crypto";
import setupSecurityMiddleware from "./security";
import errorHandler from "./errorHandler";
import { logOut } from "@utils/logging";
import { logRequest } from "@server/logging";
import config from "@server/config";

/**
 * Configures and applies all middleware to the provided Express app.
 *
 * - Logs all incoming requests with timestamp, method, and URL (dev only, excludes health).
 * - Writes structured NDJSON request logs to files.
 * - Parses JSON and URL-encoded request bodies.
 * - (Optionally) compresses responses using gzip (Brotli not supported in Bun as of 2025-03-17).
 * - Applies custom security middleware.
 * - Registers centralized error handling as the last middleware.
 *
 * @param {import('express').Application} app - The Express application instance to configure.
 * @returns {void}
 */
export default function setupMiddleware(app) {
  // Dev-only request logging to stdout, excludes health check noise
  if (config.env === "development") {
    app.use((req, res, next) => {
      if (!req.url.startsWith("/health")) {
        logOut("Middleware", `${req.method} ${req.url}`);
      }
      next();
    });
  }

  /**
   * Request logging middleware for file-based NDJSON logging.
   * Captures response time and bytes written on the finish event.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  app.use((req, res, next) => {
    if (!req.id) {
      req.id = crypto.randomUUID();
    }

    const startTime = Date.now();

    res.on("finish", () => {
      const responseTimeMs = Date.now() - startTime;
      const responseSizeBytes = res.socket?.bytesWritten ?? 0;
      logRequest(req, res, responseTimeMs, responseSizeBytes);
    });

    next();
  });

  // Parse JSON and URL-encoded data
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Compress responses (gzip only; Brotli not supported in Bun as of 2025-03-17)
  // Uncomment below if/when Bun supports zlib.createBrotliCompress
  app.use(
    compression({
      // Force gzip only, don't try to use Brotli
      level: 6, // compression level (1-9)
      strategy: 0, // compression strategy
      filter: (req, res) => {
        // Don't compress if specifically requested not to
        if (req.headers["x-no-compression"]) {
          return false;
        }
        // Always compress CSS files for faster delivery
        if (req.url.endsWith(".css")) {
          return true;
        }
        return compression.filter(req, res);
      },
    }),
  );

  // Apply security middleware (custom)
  setupSecurityMiddleware(app);

  // Apply error handling middleware (should be the last middleware)
  app.use(errorHandler);
}
