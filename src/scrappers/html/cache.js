import { logError } from "@utils/logging";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseBool } from "@utils/sanity";

const CACHE_CONFIG = {
  enabled: parseBool(process.env.HTML_CACHE_ENABLED, true),
  baseDirectory: process.env.HTML_CACHE_DIR || "./data/html",
  // maxAge: parseInt(process.env.HTML_CACHE_MAX_AGE, 10) || 86400000, // Default to 24 hours
  removeScripts: parseBool(process.env.HTML_CACHE_REMOVE_SCRIPTS, true),
  removeStyles: parseBool(process.env.HTML_CACHE_REMOVE_STYLES, false),
  removeComments: parseBool(process.env.HTML_CACHE_REMOVE_COMMENTS, false),
};

/**
 * Configuration for HTML caching
 *
 * @typedef {Object} HtmlCacheConfig
 * @property {number} [maxAge] - Maximum age of cached files in milliseconds (optional)
 */

/**
 * Generates a cache key from a URL
 *
 * @param {string} url - The URL to generate a cache key for
 * @returns {string} A hash-based cache key
 */
export function generateCacheKey(url) {
  const hash = createHash("sha256").update(url).digest("hex");
  // Use first 16 chars of hash for readability, keep URL info for debugging
  const urlPart = url
    .replace(/^https?:\/\/www\./, "")
    // .replace(/(.com|.php)/g, "")
    .replace(/[^a-z0-9]/gi, "_")
    .substring(0, 50);
  return `${urlPart}_${hash.substring(0, 16)}`;
}

/**
 * Gets the file path for a cached HTML file
 *
 * @param {string} cacheKey - The cache key
 * @returns {string} The full file path
 */
function getCacheFilePath(cacheKey) {
  return join(CACHE_CONFIG.baseDirectory, `${cacheKey}.html`);
}

/**
 * Reads HTML content from cache
 *
 * @param {string} cacheKey - The cache key
 * @param {number} [maxAge] - Maximum age in milliseconds
 * @returns {string|null} The cached HTML content, or null if not found/expired
 */
export function readFromCache(cacheKey, maxAge) {
  if (!CACHE_CONFIG.enabled) return null;
  const filePath = getCacheFilePath(cacheKey);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    logError("HTML Cache", `Failed to read cache file ${filePath}`, error);
    return null;
  }
}

/**
 * Writes HTML content to cache
 *
 * @param {string} cacheKey - The cache key
 * @param {string} html - The HTML content to cache
 * @returns {boolean} True if successfully written
 */
export function writeToCache(cacheKey, html) {
  if (!CACHE_CONFIG.enabled) return null;
  // Ensure cache directory exists
  try {
    mkdirSync(CACHE_CONFIG.baseDirectory, { recursive: true });
  } catch (error) {
    logError(
      "HTML Cache",
      `Failed to create cache directory ${CACHE_CONFIG.baseDirectory}:`,
      error,
    );
    return false;
  }

  const filePath = getCacheFilePath(cacheKey);

  try {
    writeFileSync(filePath, html, "utf-8");
    return true;
  } catch (error) {
    logError("HTML Cache", `Failed to write cache file ${filePath}`, error);
    return false;
  }
}
