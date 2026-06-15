import fs from "fs";
import path from "path";
import config from "@server/config";
import { logError } from "@utils/logging";
import {
  ensureDir,
  getFileSize,
  getFileCreatedAt,
  checkAndRotate,
  enforceRetention,
} from "@utils/fileRotation";

/**
 * Log directory on the mounted volume.
 * Defaults to /tourRanking/data/logs to reuse the existing data volume.
 * @type {string}
 */
const LOG_DIR = process.env.LOG_DIR || "/tourRanking/data/logs";

/**
 * Rotation configuration for a single log target.
 * @typedef {Object} RotationConfig
 * @property {number} rotationDays - Days before rotation triggers
 * @property {number} rotationSizeMB - Megabytes before rotation triggers
 * @property {number|null} retentionDays - Days to keep rotated files (null = forever)
 */

/**
 * State for a single log file target.
 * @typedef {Object} LogTarget
 * @property {string} filePath - Absolute path to the current log file
 * @property {RotationConfig} config - Rotation/retention config for this target
 * @property {number} currentSizeBytes - Tracked size of the current file
 * @property {Date} createdAt - When the current file was created
 */

/**
 * File transport that writes NDJSON entries to separate log files.
 * Handles async writes, rotation, and retention using the generic fileRotation utility.
 */
class FileTransport {
  /**
   * Map of log target names to their state.
   * @type {Map<string, LogTarget>}
   */
  #targets;

  /**
   * Whether file logging is enabled.
   * @type {boolean}
   */
  #enabled;

  /**
   * Creates and initializes the file transport.
   */
  constructor() {
    this.#enabled = config.logging?.enabled !== false;
    this.#targets = new Map();

    if (this.#enabled) {
      this.#initTargets();
    }
  }

  /**
   * Initializes the four log targets (access, api, health, static).
   * @private
   */
  #initTargets() {
    const loggingConfig = config.logging || {};

    const targets = [
      { name: "access", config: loggingConfig.access || {} },
      { name: "api", config: loggingConfig.api || {} },
      { name: "health", config: loggingConfig.health || {} },
      { name: "static", config: loggingConfig.static || {} },
    ];

    for (const { name, config: targetConfig } of targets) {
      this.#targets.set(name, {
        filePath: path.join(LOG_DIR, `${name}.log`),
        config: {
          rotationDays: targetConfig.rotationDays ?? 90,
          rotationSizeMB: targetConfig.rotationSizeMB ?? 50,
          retentionDays: targetConfig.retentionDays ?? null,
        },
        currentSizeBytes: 0,
        createdAt: new Date(),
        writeQueue: Promise.resolve(),
      });
    }
  }

  /**
   * Initializes the transport by ensuring directories exist and loading current file sizes.
   * Also runs initial retention cleanup.
   *
   * If the log directory cannot be created (e.g., permission issues on the volume),
   * file logging is gracefully disabled with a warning. The server continues to
   * operate normally without file-based request logging.
   *
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.#enabled) return;

    try {
      await ensureDir(LOG_DIR);
    } catch (error) {
      logError(
        "FileTransport",
        "Cannot create log directory — file logging disabled",
        error,
        { logDir: LOG_DIR },
      );
      console.warn(
        `[FileTransport] WARNING: File logging is disabled. The log directory "${LOG_DIR}" could not be created.`,
      );
      console.warn(
        `[FileTransport] The app will continue without file-based request logging.`,
      );
      this.#enabled = false;
      return;
    }

    for (const [, target] of this.#targets) {
      target.currentSizeBytes = await getFileSize(target.filePath);
      target.createdAt = await getFileCreatedAt(target.filePath);

      if (target.config.retentionDays != null) {
        await enforceRetention(
          LOG_DIR,
          target.filePath,
          target.config.retentionDays,
        );
      }
    }
  }

  /**
   * Maps a resource type to the corresponding file target name.
   *
   * @param {string} resourceType - The classified resource type
   * @returns {string} The target log file name
   */
  getTarget(resourceType) {
    switch (resourceType) {
      case "api":
        return "api";
      case "health":
        return "health";
      case "static-asset":
        return "static";
      default:
        return "access";
    }
  }

  /**
   * Writes a complete entry to the specified log target.
   * Async fire-and-forget — never blocks the caller.
   *
   * @param {string} targetName - Target log file name (e.g., 'access', 'api')
   * @param {Object} entry - Complete log entry object (caller-defined schema)
   * @returns {void}
   */
  write(targetName, entry) {
    if (!this.#enabled) return;

    const target = this.#targets.get(targetName);
    if (!target) return;

    const line = JSON.stringify(entry) + "\n";
    const bytes = Buffer.byteLength(line);

    this.#writeAsync(target, line, bytes).catch((error) => {
      logError("FileTransport", "Failed to write log entry", error, {
        targetName,
      });
    });
  }

  /**
   * Writes a line to the log file asynchronously, checking rotation first.
   *
   * @param {LogTarget} target - The log target to write to
   * @param {string} line - NDJSON line to write
   * @param {number} bytes - Byte length of the line
   * @returns {Promise<void>}
   * @private
   */
  async #writeAsync(target, line, bytes) {
    await checkAndRotate(target);
    await fs.promises.appendFile(target.filePath, line);
    target.currentSizeBytes += bytes;
  }

  /**
   * Checks if file logging is enabled.
   * @returns {boolean}
   */
  get enabled() {
    return this.#enabled;
  }
}

/**
 * Singleton file transport instance.
 * @type {FileTransport | null}
 */
let fileTransportInstance = null;

/**
 * Gets or creates the singleton file transport instance.
 *
 * @returns {FileTransport}
 */
export function getFileTransport() {
  if (!fileTransportInstance) {
    fileTransportInstance = new FileTransport();
  }
  return fileTransportInstance;
}

/**
 * Initializes the file transport (call once at server startup).
 *
 * @returns {Promise<void>}
 */
export async function initializeFileTransport() {
  const transport = getFileTransport();
  await transport.initialize();
}

export default getFileTransport;
