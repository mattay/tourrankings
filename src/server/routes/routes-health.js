import express from "express";
import { getHealth } from "@server/controllers/healthController";

const router = express.Router();

/**
 * Health check routes
 */
router.get("/", getHealth);

export { router as routesHealth };
