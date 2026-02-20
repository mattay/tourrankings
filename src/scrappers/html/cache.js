import { logError } from "@utils/logging";
import { parseBool } from "@utils/sanity";
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { html_beautify } from "js-beautify";
import { join } from "path";

const CACHE_CONFIG = {
  enabled: parseBool(process.env.HTML_CACHE_ENABLED, true),
  baseDirectory: process.env.HTML_CACHE_DIR || "./data/html",
  beautify: process.env.HTML_CACHE_BEAUTIFY || false,
  removeScripts: parseBool(process.env.HTML_CACHE_REMOVE_SCRIPTS, true),
  removeStyles: parseBool(process.env.HTML_CACHE_REMOVE_STYLES, false),
  removeComments: parseBool(process.env.HTML_CACHE_REMOVE_COMMENTS, false),
};

/**
 * Beautify options for HTML output
 * @type {import('js-beautify').HTMLBeautifyOptions}
 */
const BEAUTIFY_OPTIONS = {
  indent_size: 2,
  indent_char: " ",
  max_preserve_newlines: 0,
  preserve_newlines: true,
  indent_inner_html: true,
  end_with_newline: true,
  wrap_line_length: 0,
  unformatted: ["code", "pre", "textarea"],
  content_unformatted: ["pre", "textarea"],
  indent_scripts: "keep",
};

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
 * @returns {string|null} The cached HTML content, or null if not found
 */
export function readFromCache(cacheKey) {
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
 * Cleans HTML by removing script tags and optionally other elements
 *
 * @param {string} html - The HTML content to clean
 * @returns {string} Cleaned HTML content
 */
export function cleanHtml(html) {
  let cleaned = html;

  // Remove script tags (including inline scripts and external scripts)
  if (CACHE_CONFIG.removeScripts) {
    // Remove script tags with any attributes
    cleaned = cleaned.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>\n?/gi,
      "",
    );
    // Remove any remaining self-closing script tags
    cleaned = cleaned.replace(/<script[^>]*\/>/gi, "");
  }

  // Remove style tags (optional)
  if (CACHE_CONFIG.removeStyles) {
    cleaned = cleaned.replace(
      /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
      "",
    );
  }

  // Remove HTML comments (optional)
  if (CACHE_CONFIG.removeComments) {
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, "");
  }

  return CACHE_CONFIG.beautify
    ? html_beautify(cleaned, BEAUTIFY_OPTIONS)
    : cleaned;
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
    const cleanedHtml = cleanHtml(html);
    writeFileSync(filePath, cleanedHtml, "utf-8");
    return true;
  } catch (error) {
    logError("HTML Cache", `Failed to write cache file ${filePath}`, error);
    return false;
  }
}
