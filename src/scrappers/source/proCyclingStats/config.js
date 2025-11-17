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

if (!Object.hasOwn(process.env, "PUPPETEER_EXECUTABLE_PATH")) {
  console.error("PUPPETEER_EXECUTABLE_PATH environment variable is not set.");
  process.exit(1);
}
if (!Object.hasOwn(process.env, "PUPPETEER_HEADLESS")) {
  console.error("PUPPETEER_HEADLESS environment variable is not set.");
  process.exit(1);
}

/** @type {Config} */
export const config = {
  browser: {
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    headless: process.env.PUPPETEER_HEADLESS || "new",
    defaultViewport: { width: 1024, height: 768 }, // Set explicit small viewport
    args: [
      // Required for most hosting environments
      "--no-sandbox",
      "--disable-setuid-sandbox",
      // Memory/performance (safe for chrome-headless-shell)
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
      "--disable-backgrounding-occluded-windows",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=TranslateUI,BlinkGenPropertyTrees",
    ],
  },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  domains: {
    whitelist: [
      "www.procyclingstats.com",
      "cloudflare.com",
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
    blacklist: ["image", "media", "font", "websocket", "manifest", "other"],
  },
  wait: 420,
  timeout: 12000,
};

export default config;
