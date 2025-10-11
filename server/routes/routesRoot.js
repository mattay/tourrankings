import express from "express";
import { seasonRaces } from "../controllers/raceController";
import { logError } from "../../src/utils/logging";
import { getErrorHTML, getErrorText } from "../utils/errorMessages";

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
 * @property {RacesData|null} races - Race data organized by status or null if unavailable
 * @property {boolean} hasError - Whether an error state should be displayed
 * @property {string} [errorMessage] - Optional user-friendly error message
 */

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
  const homePage = {
    title: "Tour Rankings",
    description: "A web application for tracking and ranking tours.",
    keywords: "tour, ranking, web application",
    races: null,
    hasError: false,
  };

  try {
    const races = seasonRaces();

    // Check if races data is available and has any content
    const hasRaceData =
      races &&
      (races.current?.length > 0 ||
        races.upcoming?.length > 0 ||
        races.previous?.length > 0 ||
        races.future?.length > 0);

    // Check if races data is available and valid
    if (!hasRaceData) {
      logError(
        "Routes Root",
        getErrorText("NO_DATA"),
        new Error("seasonRaces() returned empty data"),
      );

      homePage.hasError = true;
      homePage.errorMessage = getErrorHTML("NO_DATA");
    } else {
      homePage.races = races;
    }

    res.render("pages/home", homePage);
  } catch (error) {
    logError("Routes Root", getErrorText("RENDER_ERROR"), error);

    // Instead of passing to error handler, render a graceful error state
    try {
      /** @type {HomePageContent} */
      const errorPage = {
        ...homePage,
        hasError: true,
        errorMessage: getErrorHTML("RENDER_ERROR"),
      };

      res.render("pages/home", errorPage);
    } catch (renderError) {
      // If even the error page fails to render, pass to Express error handler
      logError("Routes Root", getErrorText("CATASTROPHIC"), renderError);
      next(error);
    }
  }
});

// export default router;
export { router as routesRoot };
