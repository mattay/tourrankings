/**
 * @typedef {import('puppeteer-core').Page} Page - Puppeteer
 */

/**
 * Fetches HTML content from a URL using Puppeteer
 * @param {Page} page - The Puppeteer page object
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithPuppeteer(page, url) {
  await page.goto(url, { waitUntil: "networkidle2" });
  return await page.content();
}

/**
 * Fetches HTML content using native fetch (for SSR pages)
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The HTML content of the page
 */
export async function fetchHtmlWithFetch(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}
