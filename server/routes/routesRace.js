import express from "express";
import { raceContent } from "../controllers/raceController";
import { logOut } from "../../src/utils/logging";

/** @type {import('../controllers/raceController').RaceContent} RaceContent */

/** @type {import('express').Router} */
const router = express.Router();

/**
 * @typedef {Object} PageContentRace
 * @property {string} title - The title of the page.
 * @property {string} description - The description of the page.
 * @property {string[]} keywords - The keywords for the page.
 * @property {Object} race - The race object.
 * @property {Object} stage - The stage object.
 */

/**
 *
 * @param {string} racePcsID - The ID of the race.
 * @param {number} year - The year of the race.
 * @returns {PageContentRace}
 */
function racePageContent(racePcsID, year = null) {
  const content = raceContent(racePcsID, year || new Date().getFullYear());
  // console.debug(content);

  const keywords = ["cycling", "tour", "ranking", content.race?.raceName];
  const racePage = {
    title: "Tour Rankings",
    description: "A web application for tracking and ranking tours.",
    keywords,
    race: content.race,
    stage: content.viewingStage,
  };
  return racePage;
}

/**
 * Race route handler.
 * Renders the race page.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next function.
 * @returns {void}
 */
router.get("/:racePcsID/:year?/:stage?/:ranking?", (req, res, next) => {
  const { racePcsID } = req.params;
  const year = Number(req.params.year) || null;
  const pageContent = racePageContent(racePcsID, year);

  if (!pageContent.race) {
    // TODO: Implement error handling for missing race data
    return res.status(404).send("Race not found");
  }

  try {
    res.render("pages/race", pageContent);
  } catch (error) {
    logOut("Unable to render /", error);
    next(error); // Passes error to Express error handler
  }
});

export { router as routesRace };
