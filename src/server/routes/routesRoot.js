import express from "express";
import { seasonRaces } from "@server/controllers/raceController";
import { logError } from "@utils/logging";
import { getErrorHTML, getErrorText } from "@server/utils/errorMessages";
import { validateYear } from "src/utils/date";

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

      page.hasError = true;
      page.errorMessage = getErrorHTML("NO_DATA");
      res.status(503);
    } else {
      page.races = races;
    }

    res.render("pages/home", page);
  } catch (error) {
    logError("Routes Root", getErrorText("RENDER_ERROR"), error);

    // Instead of passing to error handler, render a graceful error state
    try {
      /** @type {HomePageContent} */
      const errorPage = {
        ...page,
        hasError: true,
        errorMessage: getErrorHTML("RENDER_ERROR"),
      };

      res.status(500).render("pages/home", errorPage);
    } catch (renderError) {
      // If even the error page fails to render, pass to Express error handler
      logError("Routes Root", getErrorText("CATASTROPHIC"), renderError);
      next(error);
    }
  }
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
    description: `Season ${year || "Unknown"}`,
    keywords: "tour, ranking, web application",
    season: year,
    races: null,
    hasError: false,
  };

  try {
    const races = seasonRaces(year);

    // Check if races data is available and has any content
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

    // Instead of passing to error handler, render a graceful error state
    try {
      /** @type {HomePageContent} */
      const errorPage = {
        ...page,
        hasError: true,
        errorMessage: getErrorHTML("RENDER_ERROR"),
      };

      res.status(500).render("pages/home", errorPage);
    } catch (renderError) {
      // If even the error page fails to render, pass to Express error handler
      logError("Routes Root", getErrorText("CATASTROPHIC"), renderError);
      next(error);
    }
  }
});

export { router as routesRoot };
