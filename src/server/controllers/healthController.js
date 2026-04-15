/**
 * Health check controller for monitoring application status
 */

import dataService from "@services/dataServiceInstance";
import config from "@server/config";
import { logError } from "@utils/logging";
import { getAppVersion } from "@utils/version";
import fs from "fs/promises";

/**
 * Health check endpoint that reports application and subsystem statuses.
 *
 * Sends a JSON object containing: overall `status`, `timestamp`, `uptime`, `environment`,
 * `version`, a `checks` map for `dataService`, `filesystem` and `memory`, optional
 * `memoryUsage` metrics, and `responseTime`. Responds with HTTP 200 when the overall
 * status is `healthy`, otherwise responds with HTTP 503.
 *
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export async function getHealth(req, res) {
  const startTime = Date.now();

  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: getAppVersion(),
      checks: {
        dataService: "checking",
        filesystem: "checking",
        memory: "checking",
      },
    };

    // Check data service
    try {
      const isInitialized = dataService.isInitialized ?? false;
      healthStatus.checks.dataService = isInitialized ? "healthy" : "unhealthy";
    } catch (error) {
      healthStatus.checks.dataService = "unhealthy";
      logError("Health", "Data service check failed", error);
    }

    // Check filesystem access
    const dataDir = process.env.DATA_DIR;
    if (!dataDir) {
      healthStatus.checks.filesystem = "unconfigured";
    } else {
      try {
        await fs.access(dataDir);
        healthStatus.checks.filesystem = "healthy";
      } catch (error) {
        healthStatus.checks.filesystem = "unhealthy";
        logError("Health", "Filesystem check failed", error);
      }
    }

    // Check memory usage
    try {
      const memUsage = process.memoryUsage();
      const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const threshold = config.healthCheck.memoryWarningThresholdMB;
      healthStatus.checks.memory = memoryMB < threshold ? "healthy" : "warning";
      healthStatus.memoryUsage = {
        heapUsed: `${memoryMB}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      };
    } catch (error) {
      healthStatus.checks.memory = "unhealthy";
      logError("Health", "Memory check failed", error);
    }

    // Overall status
    const anyUnhealthy = Object.values(healthStatus.checks).some(
      (check) => check === "unhealthy",
    );
    if (anyUnhealthy) {
      healthStatus.status = "degraded";
    }

    // Add response time
    healthStatus.responseTime = `${Date.now() - startTime}ms`;

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    const safeErrorMessage = error?.message ?? String(error);
    logError("Health", "Health check failed", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: safeErrorMessage,
      responseTime: `${Date.now() - startTime}ms`,
    });
  }
}
