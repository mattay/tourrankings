// @ts-check
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import config from "./config";
import setupMiddleware from "./middleware";
import routes from "./routes";

/**
 * Absolute path to the current file (ESM equivalent of __filename).
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Absolute path to the current directory (ESM equivalent of __dirname).
 * @type {string}
 */
const __dirname = dirname(__filename);

/**
 * Absolute path to the public directory.
 * @type {string}
 */
const publicPath = config.paths.public;

/**
 * Express application instance.
 * @type {import('express').Application}
 */
const app = express();

// Apply all middleware (logging, parsing, security, error handling, etc.)
setupMiddleware(app);

// Mount API routes under /api
app.use("/api", routes);

// Serve static files from the public directory
app.use(express.static(publicPath));

/**
 * Root route handler.
 * Serves the main HTML file for the root URL.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
app.get("/", (req, res) => {
  res.sendFile(join(publicPath, "index.html"));
});

// Start the server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.env} mode`);
});

/**
 * Handle unhandled promise rejections globally.
 *
 * @param {unknown} err - The rejection reason or error.
 * @returns {void}
 */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection", err);
  // In production, you might want to exit the process
  // process.exit(1);
});

export default app;
