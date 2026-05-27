import config from "@server/config";
import { logError } from "@utils/logging";

/**
 * Checks current memory usage against a configurable threshold.
 *
 * @returns {{ memoryCheck: "healthy" | "warning" | "unhealthy" | "check failed", memoryUsage: { heapUsed: string, heapTotal: string } }}
 */
export function statusOfMemory() {
  const status = {
    memoryUsage: {
      heapUsed: "",
      heapTotal: "",
    },
    memoryCheck: "check failed",
  };
  try {
    const memUsage = process.memoryUsage();
    const memoryMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const threshold = config.healthCheck?.memoryWarningThresholdMB ?? 400;

    status.memoryCheck = memoryMB < threshold ? "healthy" : "warning";
    status.memoryUsage = {
      heapUsed: `${memoryMB}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    };
  } catch (error) {
    status.memoryCheck = "unhealthy";
    logError("Health", "Memory check failed", error);
  }

  return status;
}
