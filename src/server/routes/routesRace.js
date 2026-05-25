import express from "express";
import { raceContent } from "@server/controllers/raceController";
import { racePagePresenter } from "src/server/presenters/race-presenterr";
import { logError } from "@utils/logging";
import { validateYear } from "@utils/date";
import { validateStage } from "@cycling/stage/stage";

/** @type {import('express').Router} */
const router = express.Router();

// <host>/race/paris-nice/2026/5/general
router.get(
  "/:racePcsID{/:year}{/:stage}{/:classification}",
  (req, res, next) => {
    const { racePcsID } = req.params;
    const year = validateYear(req.params.year);
    const stage = validateStage(req.params.stage);
    const classification = req.params.classification || null;
    const content = raceContent(racePcsID, year);

    if (!content.race) {
      return res.status(404).send("Race not found");
    }

    try {
      const page = racePagePresenter(content, stage, classification);
      res.render("pages/race", page);
    } catch (error) {
      logError("Routes Race", "Unable to render race page", error);
      next(error);
    }
  },
);

export { router as routesRace };
