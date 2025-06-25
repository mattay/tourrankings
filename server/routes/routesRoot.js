import express from "express";
import { seasonRaces } from "../controllers/raceController";
import { logError } from "../../src/utils/logging";

const router = express.Router();

/**
 * Root route handler.
 * Serves the main HTML file for the root URL.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
router.get("/", (req, res, next) => {
  try {
    const homePage = {
      title: "Tour Rankings",
      description: "A web application for tracking and ranking tours.",
      keywords: "tour, ranking, web application",
      races: seasonRaces(),
    };

    res.render("pages/home", homePage);
  } catch (error) {
    logError("Routes Root", "Unable to render /", error);
    next(error); // Passes error to Express error handler
  }
});

// export default router;
export { router as routesRoot };
