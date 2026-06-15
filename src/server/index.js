import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import config from "./config";
import setupMiddleware from "@server/middleware";
import { htmlProcessorMiddleware } from "@server/middleware/htmlProcessor";
import {
  routesAPI,
  routesRace,
  routesSeasonRaces,
  routesHealth,
} from "@server/routes";
import dataService from "@services/dataServiceInstance";
import { logError, logOut } from "@utils/logging";
import { getAppVersion } from "@utils/version";
import { initializeFileTransport } from "@server/logging";

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

    // Templating
    app.set("view engine", "ejs");
    app.set("views", join(__dirname, "views"));
    app.set("view cache", process.env.NODE_ENV === "production");

    // Apply HTML processor middleware
    app.use(htmlProcessorMiddleware);
  } catch (error) {
    logError("Server", "Failed to configure server", error);
    process.exit(1);
  }
}

/**
 * Register application routes and static asset handling.
 *
 * Serves static files with appropriate caching and headers, mounts the health endpoint at `/health`,
 * the API under `/api`, race routes under `/race`, and the main view routes at `/`. Adds a 404
 * handler that renders an error page for unmatched requests.
 *
 * @param {import('express').Application} app - The Express application instance to configure.
 */
async function setupRoutes(app) {
  try {
    // CRITICAL: Serve static files FIRST, before any route handlers
    app.use(
      express.static(config.paths.public, {
        // Enable caching for better performance
        maxAge: config.env === "production" ? "1d" : "1h",
        setHeaders: (res, path) => {
          if (path.endsWith(".css")) {
            res.set("Content-Type", "text/css");
            // Prevent FOUC by ensuring CSS loads before render
            res.set("Cache-Control", "public, max-age=31536000");
          }
        },
      }),
    );

    app.use("/health", routesHealth);

    // Mount API routes under /api
    app.use("/api", routesAPI);

    // Mount race routes before root and static handlers
    app.use("/race", routesRace); // This will match /:racePcsID

    // Mount view routes at the application level
    app.use("/", routesSeasonRaces);

    // Privacy notice
    app.get("/privacy", (req, res) => {
      res.render("pages/privacy", {
        title: "Privacy Notice",
      });
    });

    // Add 404 handler for undefined routes
    app.use((req, res) => {
      res.status(404).render("pages/error", {
        title: "Page Not Found",
        message: `The page ${req.path} could not be found.`,
      });
    });
  } catch (error) {
    logError("Server", "Failed to configure routes", error);
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
    logError("Server", "Failed to start server", error);
    process.exit(1);
  }
}

/**
 * Initializes the data service
 *
 * @returns {Promise<void>}
 */
async function initializeDataService() {
  try {
    await dataService.initialize();
  } catch (error) {
    logError("DataService", "Failed to initialize data service", error);
  }
}

function validateEnvironment() {
  const appVersion = getAppVersion();
  if (!appVersion || appVersion.trim() === "") {
    logOut(
      "Config",
      "APP_VERSION is empty or not set. Version-dependent features may not work correctly.",
      "warn",
    );
  }
}

/**
 * Initialize and start the server
 */
async function initializeServer() {
  try {
    validateEnvironment();
    await setupServer(app);
    await setupRoutes(app);
    await initializeFileTransport();
    await initializeDataService();
    await startServer(app);

    // Handle unhandled promise rejections globally
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
