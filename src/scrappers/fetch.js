import { config } from "./source/proCyclingStats";

/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
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
 * @param {{ timeout?: number, headers?: Record<string,string> }} [options] - Options for the fetch request
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithFetch(url, options = {}) {
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
    throw new Error(
      `fetchHtmlWithFetch failed for ${url}: ${error?.message ?? error}`,
      { cause: error },
    );
  } finally {
    clearTimeout(id);
  }
}
