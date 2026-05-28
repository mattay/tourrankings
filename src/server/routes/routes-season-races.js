import express from "express";
import { seasonRaces } from "@server/controllers/raceController";
import { getErrorHTML, getErrorText } from "@server/utils/errorMessages";
import { validateYear } from "@utils/date";
import { logError } from "@utils/logging";
import { seasonRacesPresenter } from "@server/presenters/season-races-presenter";

const router = express.Router();

/**
 * @typedef {Object} RacesData
 * @property {Object[]} current - Currently active races
 * @property {Object[]} upcoming - Upcoming races
 * @property {Object[]} previous - Recently completed races
 * @property {Object[]} future - Future scheduled races
 */

/**
 * @typedef {Object} HomePageContent
 * @property {string} title - The title of the page
 * @property {string} description - The description of the page
 * @property {string} keywords - The keywords for the page
 * @property {number|null} season - The season year, or null for the current view
 * @property {RacesData|null} races - Race data organized by status or null if unavailable
 * @property {boolean} hasError - Whether an error state should be displayed
 * @property {string} [errorMessage] - Optional user-friendly error message
 */

/**
 * Renders the home page with race data.
 *
 * @param {express.Response} res - The Express response object
 * @param {Function} next - The Express next middleware function
 * @param {HomePageContent} page - The page content object
 */
function renderSeasonPage(res, next, page) {
  try {
    if (page.hasError) {
      logError(
        "Routes Root",
        getErrorText("NO_DATA"),
        new Error(`seasonRaces(${page.season}) returned empty data`),
      );
      res.status(503);
    }
    res.render("pages/season-races", page);
  } catch (error) {
    logError("Routes Root", getErrorText("RENDER_ERROR"), error);
    try {
      res.status(500).render("pages/season-races", {
        ...page,
        hasError: true,
        errorMessage: getErrorHTML("RENDER_ERROR"),
      });
    } catch (renderError) {
      logError("Routes Root", getErrorText("CATASTROPHIC"), renderError);
      next(error);
    }
  }
}

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
  const races = seasonRaces();
  const page = seasonRacesPresenter(races);

  renderSeasonPage(res, next, page);
});

/**
 * Route handler for the season page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.get("/season/{:year}", (req, res, next) => {
  const season = validateYear(req.params.year);
  const races = seasonRaces(season);
  const page = seasonRacesPresenter(races, { season });

  renderSeasonPage(res, next, page);
});

export { router as routesSeasonRaces };
