import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import config from "./config";
import setupMiddleware from "./middleware";
import { routesAPI, routesRace, routesRoot } from "./routes";
import { logError, logOut } from "../src/utils/logging";
import dataService from "../src/services/dataServiceInstance";

// Absolute path to the current file (ESM equivalent of __filename).
const __filename = fileURLToPath(import.meta.url);
// Absolute path to the current directory (ESM equivalent of __dirname).
const __dirname = dirname(__filename);

/**
 * Express application instance.
 * @type {import('express').Application}
 */
const app = express();

/**
 * Sets up server middleware, view engine, and other configurations.
 * @param {import('express').Application} app - Express application instance.
 * @returns {Promise<void>}
 */
async function setupServer(app) {
  try {
    // Apply all middleware (logging, parsing, security, error handling, etc.)
    setupMiddleware(app);

    // Data service instance
    await dataService.initialize();

    // Templating
    app.set("view engine", "ejs");
    app.set("views", join(__dirname, "views"));
  } catch (error) {
    logError("Server", "Failed to configure server");
    logError("Server", error);
    process.exit(1);
  }
}

/**
 * Sets up all routes for the application
 *
 * @param {import('express').Application} app - Express application instance
 * @returns {Promise<void>}
 */
async function setupRoutes(app) {
  try {
    // Mount API routes under /api
    app.use("/api", routesAPI);

    // Mount race routes before root and static handlers
    app.use("/race", routesRace); // This will match /:racePcsID

    // Mount view routes at the application level
    app.use("/", routesRoot);

    // Serve static files from the public directory
    app.use(express.static(config.paths.public));
    // Add 404 handler for undefined routes
    app.use((req, res) => {
      res.status(404).render("pages/error", {
        title: "Page Not Found",
        message: `The page ${req.path} could not be found.`,
      });
    });
  } catch (error) {
    logError("Server", "Failed to configure routes");
    logError("Server", error);
    process.exit(1);
  }
}

/**
 * Starts the Express server
 *
 * @param {import('express').Application} app - Express application instance
 * @returns {Promise<void>}
 */
async function startServer(app) {
  try {
    app.listen(config.port, () => {
      logOut("Server", `Running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logError("Server", "Failed to start server");
    logError("Server", error);
    process.exit(1);
  }
}

/**
 * Initialize and start the server
 */
async function initializeServer() {
  try {
    await setupServer(app);
    await setupRoutes(app);
    await startServer(app);

    // Handle unhandled promise rejections globally
    // TODO: Implement proper error handling and logging
    process.on("unhandledRejection", (reason, promise) => {
      const message =
        reason instanceof Error ? reason : new Error(String(reason));
      // In production environments, consider graceful shutdown
      if (config.env === "production") {
        logError(
          "Process",
          "Initiating graceful shutdown due to unhandled rejection",
          message,
        );
        // Give existing connections time to finish
        setTimeout(() => process.exit(1), 3000);
      } else {
        logError("Process", "Unhandled Promise Rejection", message);
        // process.exit(1);
      }
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      logError("Process", "Uncaught Exception", error);
      // Always exit on uncaught exceptions
      logOut("Process", "Shutting down due to uncaught exception");
      process.exit(1);
    });
  } catch (error) {
    logError("Server", "Failed to initialize server", error);
    process.exit(1);
  }
}

// Start the server
initializeServer();

export default app;
