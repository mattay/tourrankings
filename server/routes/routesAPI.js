import express from "express";
import { getRaceData } from "../controllers/apiController";

/** @type {import('express').Router} */
const router = express.Router();

// Get race data
router.get("/race/:racePcsID/:year?", getRaceData);

// Get stage results
// router.get("/race/results/:raceUID/:stageNumber", getStageResults);

export { router as routesAPI };
