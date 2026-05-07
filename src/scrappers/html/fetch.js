import { generateCacheKey, readFromCache, writeToCache } from "./cache";
import { CONFIG } from "./config";

/**
 * @typedef {Object} FetchOptions
 * @property {number} [timeout] - Timeout in milliseconds for the fetch request
 * @property {Record<string,string>} [headers] - Headers to include in the fetch request
 */

/**
 * @typedef {Object} CacheOptions
 * @property {String} [cachePattern] - URL pattern for cache key generation
 */

/**
 * Fetches HTML content using native fetch (for SSR pages)
 * @param {string} url - The URL to fetch
 * @param {FetchOptions} [options] - Options for the fetch request
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtml(url, options = {}) {
  const { timeout = CONFIG.timeout, headers = {} } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: { ...CONFIG.headers, ...headers },
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
 *     cachePattern: 'pcs-race-tour-de-france-2024',
 *     timeout: 10000
 *   }
 * );
 */
export async function fetchHtmlWithCache(url, options = {}) {
  const { cachePattern, ttl, ...fetchOptions } = options;

  const cacheKey = generateCacheKey(cachePattern || url);
  const cachedHtml = readFromCache(cacheKey, ttl);

  if (cachedHtml) {
    return { html: cachedHtml, fromCache: true, cacheKey };
  }

  const html = await fetchHtml(url, fetchOptions);

  if (html) {
    writeToCache(cacheKey, html);
  }

  return { html, fromCache: false, cacheKey };
}
