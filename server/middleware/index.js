import express from "express";
import compression from "compression";
import setupSecurityMiddleware from "./security";
import errorHandler from "./errorHandeler";

/**
 * Configure and apply all middleware to Express app
 * @param {object} app - Express application
 */
export default function setupMiddleware(app) {
  // Parse JSON and URL-encoded data
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Compress responses
  app.use(compression());

  // Apply Security middleware
  setupSecurityMiddleware(app);

  // Apply error handling middleware (should be applied last)
  app.use(errorHandler);
}
