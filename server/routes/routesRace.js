import express from "express";
import { raceContent } from "../controllers/raceController";
import { logOut } from "../../src/utils/logging";

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
router.get("/:racePcsID", (req, res, next) => {
  const today = new Date();
  const year = today.getFullYear();
  const content = raceContent(req.params.racePcsID, year);

  console.log(content);

  if (!content.race) {
    return res.status(404).send("Race not found");
  }

  try {
    const racePage = {
      title: "Tour Rankings",
      description: "A web application for tracking and ranking tours.",
      keywords: "tour, ranking, web application",
      race: content.race,
      stage: content.viewingStage,
    };

    res.render("pages/race", racePage);
  } catch (err) {
    logOut("Unable to render /", err);
    next(err); // Passes error to Express error handler
  }
});

export { router as routesRace };
