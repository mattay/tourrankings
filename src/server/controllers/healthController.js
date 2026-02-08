/**
 * Health check controller for monitoring application status
 */
// import dataService from "../../src/services/dataServiceInstance.js";
import { logOut } from "../../src/utils/logging.js";

/**
 * Basic health check endpoint
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 */
export function getHealth(req, res) {
  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "unknown",
    };

    // Quick response for basic health check
    res.status(200).json(healthStatus);
  } catch (error) {
    logOut("Health", "Health check failed", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}

// /**
//  * Detailed health check with dependency verification
//  * @param {import('express').Request} req - Express request object
//  * @param {import('express').Response} res - Express response object
//  */
// export async function getHealthDetailed(req, res) {
//   const startTime = Date.now();

//   try {
//     const healthStatus = {
//       status: "healthy",
//       timestamp: new Date().toISOString(),
//       uptime: process.uptime(),
//       environment: process.env.NODE_ENV || "development",
//       version: process.env.npm_package_version || "unknown",
//       checks: {
//         dataService: "checking",
//         memory: "checking",
//         filesystem: "checking",
//       },
//     };

//     // Check data service
//     try {
//       const isInitialized = dataService.isInitialized?.() || true;
//       healthStatus.checks.dataService = isInitialized ? "healthy" : "unhealthy";
//     } catch (error) {
//       healthStatus.checks.dataService = "unhealthy";
//       logOut("Health", "Data service check failed", error);
//     }

//     // Check memory usage
//     try {
//       const memUsage = process.memoryUsage();
//       const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
//       healthStatus.checks.memory = memoryMB < 400 ? "healthy" : "warning";
//       healthStatus.memoryUsage = {
//         heapUsed: `${memoryMB}MB`,
//         heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
//       };
//     } catch (error) {
//       healthStatus.checks.memory = "unhealthy";
//       logOut("Health", "Memory check failed", error);
//     }

//     // Check filesystem access
//     try {
//       const dataDir = process.env.DATA_DIR || "./data";
//       // Simple test - try to access the directory
//       await import("fs/promises").then(fs => fs.access(dataDir));
//       healthStatus.checks.filesystem = "healthy";
//     } catch (error) {
//       healthStatus.checks.filesystem = "unhealthy";
//       logOut("Health", "Filesystem check failed", error);
//     }

//     // Overall status
//     const allChecksHealthy = Object.values(healthStatus.checks).every(
//       check => check === "healthy"
//     );

//     if (!allChecksHealthy) {
//       healthStatus.status = "degraded";
//     }

//     // Add response time
//     healthStatus.responseTime = `${Date.now() - startTime}ms`;

//     const statusCode = healthStatus.status === "healthy" ? 200 : 503;
//     res.status(statusCode).json(healthStatus);

//   } catch (error) {
//     logOut("Health", "Detailed health check failed", error);
//     res.status(503).json({
//       status: "unhealthy",
//       timestamp: new Date().toISOString(),
//       error: error.message,
//       responseTime: `${Date.now() - startTime}ms`,
//     });
//   }
// }
