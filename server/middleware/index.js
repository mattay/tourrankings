// @ts-check
import express from "express";
import compression from "compression";
import setupSecurityMiddleware from "./security";
import errorHandler from "./errorHandler";

/**
 * Configure and apply all middleware to Express app
 * @param {import('express').Application} app - Express application
 */
export default function setupMiddleware(app) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    req.next();
  });

  // Parse JSON and URL-encoded data
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Compress responses
  // 2025-03-17 Bun does has not implemented zlib.createBrotliCompres
  // app.use(
  //   compression({
  //     // Force gzip only, don't try to use Brotli
  //     level: 6, // compression level (1-9)
  //     strategy: 0, // compression strategy
  //     filter: (req, res) => {
  //       // Only compress responses above a certain size
  //       return req.headers["x-no-compression"]
  //         ? false
  //         : compression.filter(req, res);
  //     },
  //   }),
  // );

  // Apply Security middleware
  setupSecurityMiddleware(app);

  // Apply error handling middleware (should be applied last)
  app.use(errorHandler);
}
