import express from "express";
import compression from "compression";
import setupSecurityMiddleware from "./security";
import errorHandler from "./errorHandler";
import { logOut } from "../../src/utils/logging";

/**
 * Configures and applies all middleware to the provided Express app.
 *
 * - Logs all incoming requests with timestamp, method, and URL.
 * - Parses JSON and URL-encoded request bodies.
 * - (Optionally) compresses responses using gzip (Brotli not supported in Bun as of 2025-03-17).
 * - Applies custom security middleware.
 * - Registers centralized error handling as the last middleware.
 *
 * @param {import('express').Application} app - The Express application instance to configure.
 * @returns {void}
 */
export default function setupMiddleware(app) {
  /**
   * Request logging middleware.
   * Logs method and URL with ISO timestamp.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  app.use((req, res, next) => {
    logOut(
      "Middleware",
      `[${new Date().toISOString()}] ${req.method} ${req.url}`,
    );
    next();
  });

  // Parse JSON and URL-encoded data
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Compress responses (gzip only; Brotli not supported in Bun as of 2025-03-17)
  // Uncomment below if/when Bun supports zlib.createBrotliCompress
  /*
  app.use(
    compression({
      // Force gzip only, don't try to use Brotli
      level: 6, // compression level (1-9)
      strategy: 0, // compression strategy
      filter: (req, res) => {
        // Only compress responses above a certain size
        return req.headers["x-no-compression"]
          ? false
          : compression.filter(req, res);
      },
    }),
  );
  */

  // Apply security middleware (custom)
  setupSecurityMiddleware(app);

  // Apply error handling middleware (should be the last middleware)
  app.use(errorHandler);
}
