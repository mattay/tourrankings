/**
 * @typedef {"healthy" | "warning" | "error"} MemoryCheckStatus
 */

/**
 * @typedef {Object} MemoryUsage
 * @property {string} heapUsed  - Heap memory currently allocated (e.g. `"42MB"`)
 * @property {string} heapTotal - Total heap memory available to the process (e.g. `"128MB"`)
 */

/**
 * @typedef {Object} MemoryCheckResult
 * @property {MemoryCheckStatus} memoryCheck
 * @property {MemoryUsage}       memoryUsage
 */

/**
 * @typedef {"healthy" | "unhealthy" | "error"} DataServiceCheckStatus
 */

/**
 * @typedef {"healthy" | "unhealthy" | "error"} FilesystemCheckStatus
 */

export {};
