import express from "express";
import dataRoutes from "./dataRoutes";

const router = express.Router();

/**
 * Mounts all data-related API routes under /data.
 *
 * @see dataRoutes for detailed endpoints.
 */
router.use("/data", dataRoutes);

/**
 * Health check endpoint.
 *
 * Responds with HTTP 200 and a status message.
 *
 * @route GET /health
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {void}
 */
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(), // Fixed typo here
  });
});

export default router;
