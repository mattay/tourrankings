import express from "express";
import seasonRaces from "../options/races";

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
    const races = seasonRaces();
    console.log(races);
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

// export default router;
export { router as routesRoot };
