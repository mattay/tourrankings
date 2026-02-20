import { generateCacheKey, readFromCache, writeToCache } from "./cache";
import config from "./config-puppeteer";

/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 */

/**
 * @typedef {Object} FetchOptions
 * @property {number} [timeout] - Timeout in milliseconds for the fetch request
 * @property {Record<string,string>} [headers] - Headers to include in the fetch request
 */

/**
 * @typedef {Object} CacheOptions
 * @property {String} [pattern] - URL pattern for cache key generation
 * @property {number} [maxAge] - Maximum cache age in milliseconds
 */

/**
 * Fetches HTML content from a URL using Puppeteer
 * @param {Page} page - The Puppeteer page object
 * @param {string} url - The URL to fetch
 * @param {{ waitUntil?: 'load'|'domcontentloaded'|'networkidle0'|'networkidle2', waitForSelector?: string, timeout?: number }} [options] - Options for the fetch request
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithPuppeteer(page, url, options = {}) {
  const {
    waitUntil = "networkidle2",
    waitForSelector,
    timeout = config.timeout,
  } = options;
  try {
    const response = await page.goto(url, { waitUntil, timeout });
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()} while navigating to ${url}`);
    }
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout });
    }
    return page.content();
  } catch (error) {
    throw new Error(`fetchHtmlWithPuppeteer failed for: ${error.message}`, {
      cause: error,
    });
  }
}

/**
 * Fetches HTML content using native fetch (for SSR pages)
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} [options] - Options for the fetch request
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtml(url, options = {}) {
  const { timeout = config.timeout, headers = {} } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const defaultHeaders = {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    };
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...headers },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} while fetching ${url}`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error(`Unexpected content-type "${contentType}" for ${url}`);
    }

    return response.text();
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Timeout of ${timeout}ms exceeded while fetching ${url}`,
        { cause: error },
      );
    }
    throw new Error(`fetchHtml failed for ${url}: ${error?.message ?? error}`, {
      cause: error,
    });
  } finally {
    clearTimeout(id);
  }
}

/**
 * Fetches HTML content with caching support
 * This is the recommended function to use when migrating away from Puppeteer
 *
 * @param {string} url - The URL to fetch
 * @param {FetchOptions & CacheOptions} [options] - Options for fetch and caching
 * @returns {Promise<{html: string, fromCache: boolean, cacheKey: string}>} Result containing HTML and cache status
 *
 * @example
 * // Fetch with caching enabled
 * const result = await fetchHtmlWithCache(
 *   'https://www.procyclingstats.com/race/tour-de-france/2024',
 *   {
 *     pattern: 'pcs-race-tour-de-france-2024',
 *     timeout: 10000
 *   }
 * );
 */
export async function fetchHtmlWithCache(url, options = {}) {
  const { pattern, ...fetchOptions } = options;

  const cacheKey = generateCacheKey(pattern ? pattern : url);
  const cachedHtml = readFromCache(cacheKey);

  if (cachedHtml) {
    return { html: cachedHtml, fromCache: true, cacheKey };
  }

  const html = await fetchHtml(url, fetchOptions);

  if (html) {
    writeToCache(cacheKey, html);
  }

  return { html, fromCache: false, cacheKey };
}
