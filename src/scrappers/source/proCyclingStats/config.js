/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {Object} browser - Browser configuration options.
 * @property {Object} domains - .
 * @property {Object} domains.whitelist - List of domains to allow.
 * @property {Object} domains.blacklist - List of domains to block.
 * @property {Object} resourceTypes - .
 * @property {Object} resourceTypes.blacklist - List of resource types to block.
 * @property {number} wait - Wait time in milliseconds.
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
      "--max_old_space_size=256", // Limit Node.js heap
    ],
  },
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
};

export default config;
