// @ts-check
import express from "express";
import {
  getDataSets,
  getDatasetInfo,
  getDatasetContent,
} from "../services/dataServices";
import path from "path";
import fsP from "fs/promises";
import config from "../config";

const router = express.Router();

/**
 * GET /api/data/datasets
 * List all avalibale datasets
 */
router.get("/datasets", async (req, res, next) => {
  try {
    const datasets = await getDataSets();
    res.json({ datasets });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data/datasets/:name
 * Get info about a specific dataset
 */
router.get("/datasets/:name", async (req, res, next) => {
  try {
    const { name } = req.params;
    const datasetInfo = await getDatasetInfo(name);

    if (!datasetInfo) {
      return res.status(404).json({ error: "Dataset not found" });
    }

    res.json(info);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/data/csv/:filename
 * Get a specific CSV file
 */
router.get("/csv/:filename", async (req, res, next) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(config.paths.data.public, `${filename}.csv`);

    try {
      // Check if file exits
      await fsP.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: "CSV file not found" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename}.csv`,
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
});

export default router;
