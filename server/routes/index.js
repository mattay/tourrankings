// @ts-check
import express from "express";
import dataRoutes from "./dataRoutes";
import path from "path";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { timeStamp } from "console";

const router = express.Router();

// Mount data routes
router.use("/data", dataRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestame: new Date().toISOString(),
  });
});

export default router;
