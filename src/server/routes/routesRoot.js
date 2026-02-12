import express from "express";
import { seasonRaces } from "@server/controllers/raceController";
import { logError } from "@utils/logging";
import { getErrorHTML, getErrorText } from "@server/utils/errorMessages";
import { validateYear } from "@utils/date";

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
 * @property {number} season - The number of seasons
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
    const races = seasonRaces(page.season);
    const hasRaceData =
      races &&
      (races.current?.length > 0 ||
        races.upcoming?.length > 0 ||
        races.previous?.length > 0 ||
        races.future?.length > 0);

    if (!hasRaceData) {
      logError(
        "Routes Root",
        getErrorText("NO_DATA"),
        new Error("seasonRaces() returned empty data"),
      );
      page.hasError = true;
      page.errorMessage = getErrorHTML("NO_DATA");
      res.status(503);
    } else {
      page.races = races;
    }

    res.render("pages/home", page);
  } catch (error) {
    logError("Routes Root", getErrorText("RENDER_ERROR"), error);
    try {
      res.status(500).render("pages/home", {
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
  /** @type {HomePageContent} */
  const page = {
    title: "Tour Rankings",
    description: "A web application for tracking and ranking tours.",
    keywords: "tour, ranking, web application",
    races: null,
    season: null,
    hasError: false,
  };

  renderSeasonPage(res, next, page);
});

/**
 * Route handler for the season page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
router.get("/season/:year?", (req, res, next) => {
  const year = validateYear(req.params.year);

  /** @type {HomePageContent} */
  const page = {
    title: "Tour Rankings",
    description: `Season ${year}`,
    keywords: "tour, ranking, web application",
    season: year,
    races: null,
    hasError: false,
  };

  renderSeasonPage(res, next, page);
});

export { router as routesRoot };
