/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 */

/**
 * Fetches HTML content from a URL using Puppeteer
 * @param {Page} page - The Puppeteer page object
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithPuppeteer(page, url, options = {}) {
  const {
    waitUntil = "networkidle2",
    waitForSelector,
    timeout = 30000,
  } = options;
  try {
    await page.goto(url, { waitUntil, timeout });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout });
    }
    return await page.content();
  } catch (error) {
    throw new Error(
      `fetchHtmlWithPuppeteer failed for ${url}: ${error.message}`,
    );
  }
}

/**
 * Fetches HTML content using native fetch (for SSR pages)
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithFetch(url, options = {}) {
  const { timeout = 15000, headers = {} } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} while fetching ${url}`,
      );
    }
    return await response.text();
  } finally {
    clearTimeout(id);
  }
}
