/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {Object} browser - Browser configuration options.
 * @property {String} userAgent - User agent string.
 * @property {Object} domains - .
 * @property {Object} domains.whitelist - List of domains to allow.
 * @property {Object} domains.blacklist - List of domains to block.
 * @property {Object} resourceTypes - .
 * @property {Object} resourceTypes.blacklist - List of resource types to block.
 * @property {number} wait - Wait time in milliseconds.
 * @property {number} timeout - Timeout in milliseconds.
 */

/** @type {Config} */
export const config = {
  browser: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: "new",
    defaultViewport: { width: 1024, height: 768 }, // Set explicit small viewport
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-default-browser-check",
      "--no-zygote",
      "--single-process", // Critical for memory reduction
      "--memory-pressure-off",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-features=TranslateUI,BlinkGenPropertyTrees",
    ],
  },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  domains: {
    whitelist: [
      "www.procyclingstats.com",
      "ajax.googleapis.com",
      "code.jquery.com",
    ],
    blacklist: [
      "googletagmanager.com",
      "google-analytics.com",
      "facebook.com",
      "twitter.com",
      "doubleclick.net",
      "googlesyndication.com",
    ],
  },
  resourceTypes: {
    blacklist: [
      "image",
      "media",
      "font",
      "stylesheet", // Only block if styling isn't needed for scraping
      "websocket",
      "manifest",
      "other",
    ],
  },
  wait: 420,
  timeout: 1200,
};

export default config;
