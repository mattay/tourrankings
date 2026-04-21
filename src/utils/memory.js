import { logOut } from "@utils/logging";

/**
 * Logs current heap usage for diagnostics.
 * Only logs when DEBUG_MEMORY environment variable is set.
 * @param {string} label - Context label for the log entry.
 * @returns {void}
 */
export function logMemoryUsage(label) {
  if (!process.env.DEBUG_MEMORY) {
    return;
  }

  const mem = process.memoryUsage();
  logOut(
    "Memory",
    `${label} — RSS: ${Math.round(mem.rss / 1024 / 1024)}MB, ` +
      `Heap: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB, ` +
      `External: ${Math.round(mem.external / 1024 / 1024)}MB`,
    "debug",
  );
}
