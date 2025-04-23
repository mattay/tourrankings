// @ts-check
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import config from "./config";
import setupMiddleware from "./middleware";
import routes from "./routes";
import seasonRaces from "./options/races";

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

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));

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
app.get("/", (req, res, next) => {
  try {
    const races = seasonRaces();
    res.render("pages/home", {
      title: "TourRankings",
      description: "Explore rankings for multi-stage races.",
      races,
    });
  } catch (err) {
    console.error("Unable to render /", err);
    next(err); // Passes error to Express error handler
  }
});

/**
 * Race details route handler.
 * Handles routes in the format /:race/:year/:stage/:ranking
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
app.get("/:raceId/:year/:stageNumber/:rankingType", (req, res, next) => {
  try {
    const { raceId, year, stageNumber, rankingType } = req.params;

    const raceDetails = {
      raceId,
      raceName: raceId,
      year,
      stageNumber,
      stageName: stageNumber,
      rankingType,
    }; //TODO: Implement data service to fetch race details
    // if (!raceDetails) {
    //   // Race not found
    //   return res.status(404).render("pages/error", {
    //     title: "Race Not Found",
    //     message: `The race '${race}' for year ${year} was not found.`,
    //   });
    // }

    //raceDetails.raceName
    res.render("pages/race", {
      description: `View ${rankingType.toUpperCase()} rankings for ${raceDetails.raceName} ${year}, Stage ${stageNumber} ${raceDetails.stageName}`,
      ...raceDetails,
    });
  } catch (err) {
    console.error(`Error handling race route:`, err);
    next(err);
  }
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
