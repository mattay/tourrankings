/**
 * Health check controller for monitoring application status
 */

import { logError } from "@utils/logging";
import { getAppVersion } from "@utils/version";
import {
  statusOfDataService,
  statusOfMemory,
  statusOfFilesystem,
} from "./health";

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
      memoryUsage: {},
      checks: {
        dataService: "checking",
        filesystem: "checking",
        memory: "checking",
      },
    };
    const { memoryCheck, memoryUsage } = statusOfMemory();

    healthStatus.memoryUsage = memoryUsage;
    healthStatus.checks.dataService = statusOfDataService();
    healthStatus.checks.filesystem = await statusOfFilesystem();
    healthStatus.checks.memory = memoryCheck;

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
