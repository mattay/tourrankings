import fs from "fs";
import path from "path";

/**
 * Ensures the directory exists, creating it recursively if needed.
 * Throws if the directory cannot be created.
 *
 * @param {string} dir - Directory path
 * @returns {Promise<void>}
 * @throws {Error} If the directory cannot be created
 */
export async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Gets the current file size in bytes.
 *
 * @param {string} filePath - Path to the file
 * @returns {Promise<number>} Size in bytes, 0 if file doesn't exist
 */
export async function getFileSize(filePath) {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

/**
 * Gets the file creation time.
 *
 * @param {string} filePath - Path to the file
 * @returns {Promise<Date>} File creation time, or now if file doesn't exist
 */
export async function getFileCreatedAt(filePath) {
  try {
    const stat = await fs.promises.stat(filePath);
    return stat.birthtime || stat.ctime;
  } catch {
    return new Date();
  }
}

/**
 * Rotates a file by renaming it with an ISO timestamp suffix.
 *
 * @param {string} filePath - Current file path
 * @returns {Promise<string>} Path of the rotated file
 */
export async function rotateFile(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const rotatedPath = `${base}.${timestamp}${ext}`;

  await fs.promises.rename(filePath, rotatedPath);
  return rotatedPath;
}

/**
 * Deletes rotated files older than the retention period.
 * Matches files with the pattern `{baseName}.{timestamp}.{ext}`.
 *
 * @param {string} logDir - Directory containing files
 * @param {string} baseName - Base name of the file (e.g., 'access.log')
 * @param {number} retentionDays - Days to keep rotated files
 * @returns {Promise<void>}
 */
export async function enforceRetention(logDir, baseName, retentionDays) {
  if (retentionDays == null) return;

  try {
    const files = await fs.promises.readdir(logDir);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const ext = path.extname(baseName);
    const base = path.basename(baseName, ext);

    for (const file of files) {
      // Only match rotated files: base.YYYY-MM-DDTHH-MM-SS-MSZ.ext
      const rotatedPattern = new RegExp(
        `^${base}\\.\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}-\\d{3}Z${ext.replace(".", "\\.")}$`,
      );
      if (rotatedPattern.test(file)) {
        const filePath = path.join(logDir, file);
        const stat = await fs.promises.stat(filePath);
        if (stat.mtime < cutoff) {
          await fs.promises.unlink(filePath);
        }
      }
    }
  } catch {
    // Ignore retention errors — should never fail the caller
  }
}

/**
 * Checks if rotation is needed and performs it if so.
 * Triggers when file exceeds sizeMB OR age exceeds days.
 *
 * @param {Object} target - File target state
 * @param {number} target.currentSizeBytes - Current tracked file size
 * @param {Date} target.createdAt - When the current file was created
 * @param {number} target.config.rotationSizeMB - Max size before rotation
 * @param {number} target.config.rotationDays - Max age before rotation
 * @param {number|null} target.config.retentionDays - Retention period (null = forever)
 * @param {string} target.filePath - Absolute path to the file
 * @returns {Promise<void>}
 */
export async function checkAndRotate(target) {
  const sizeMB = target.currentSizeBytes / (1024 * 1024);
  const fileAge = new Date() - target.createdAt;
  const ageDays = fileAge / (1000 * 60 * 60 * 24);

  const needsRotation =
    sizeMB >= target.config.rotationSizeMB ||
    ageDays >= target.config.rotationDays;

  if (needsRotation) {
    try {
      await rotateFile(target.filePath);
    } catch {
      // Rotation failed — don't reset state, try again next write
      return;
    }

    if (target.config.retentionDays != null) {
      await enforceRetention(
        path.dirname(target.filePath),
        target.filePath,
        target.config.retentionDays,
      );
    }

    target.currentSizeBytes = 0;
    target.createdAt = new Date();
  }
}
