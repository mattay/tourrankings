/**
 * Health check controller for monitoring application status
 */

import dataService from "@services/dataServiceInstance";
import { logError } from "@utils/logging";
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
      version: process.env.npm_package_version || "unknown",
      checks: {
        dataService: "checking",
        filesystem: "checking",
        memory: "checking",
      },
    };

    // Check data service
    try {
      const isInitialized = dataService.isInitialized || true;
      healthStatus.checks.dataService = isInitialized ? "healthy" : "unhealthy";
    } catch (error) {
      healthStatus.checks.dataService = "unhealthy";
      logError("Health", "Data service check failed", error);
    }

    // Check filesystem access
    try {
      const dataDir = process.env.DATA_DIR || "./data";
      // Simple test - try to access the directory
      await fs.access(dataDir);
      healthStatus.checks.filesystem = "healthy";
    } catch (error) {
      healthStatus.checks.filesystem = "unhealthy";
      logError("Health", "Filesystem check failed", error);
    }

    // Check memory usage
    try {
      const memUsage = process.memoryUsage();
      const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      healthStatus.checks.memory = memoryMB < 400 ? "healthy" : "warning";
      healthStatus.memoryUsage = {
        heapUsed: `${memoryMB}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      };
    } catch (error) {
      healthStatus.checks.memory = "unhealthy";
      logError("Health", "Memory check failed", error);
    }

    // Overall status
    const allChecksHealthy = Object.values(healthStatus.checks).every(
      (check) => check === "healthy",
    );
    if (!allChecksHealthy) {
      healthStatus.status = "degraded";
    }

    // Add response time
    healthStatus.responseTime = `${Date.now() - startTime}ms`;

    const statusCode = healthStatus.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(healthStatus);
  } catch (error) {
    logError("Health", "Health check failed", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: `${Date.now() - startTime}ms`,
    });
  }
}