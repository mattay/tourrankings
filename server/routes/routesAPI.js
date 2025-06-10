import express from "express";
import { getRaceData } from "../controllers/apiController";
import {
  getFeedbackStatus,
  submitFeedback,
} from "../controllers/feedbackController";

/** @type {import('express').Router} */
const router = express.Router();

// Get race data
router.get("/race/:racePcsID/:year?", getRaceData);

// Get stage results
// router.get("/race/results/:raceUID/:stageNumber", getStageResults);

// Feedback endpoints
router.post("/feedback", submitFeedback);
router.get("/feedback", getFeedbackStatus);

export { router as routesAPI };
