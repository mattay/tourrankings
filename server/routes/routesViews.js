import express from "express";
import seasonRaces from "../options/races";

const router = express.Router();

/**
 * Root route handler.
 * Serves the main HTML file for the root URL.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
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

/**
 * Race details route handler.
 * Handles routes in the format /:race/:year/:stage/:ranking
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
router.get("/:racePcsId/:year/:stageNumber/:rankingType", (req, res, next) => {
  try {
    const { racePcsId, year, stageNumber, rankingType } = req.params;

    const raceDetails = {
      racePcsId,
      raceName: rac,
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

    console.log(raceDetails);
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

export default router;
