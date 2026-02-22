/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {number} wait - Wait time in milliseconds.
 * @property {number} timeout - Timeout in milliseconds.
 * @property {Object} headers - HTTP headers.
 * @property {string} userAgent - User agent string.
 * @property {Object} domains - .
 * @property {Object} domains.whitelist - List of domains to allow.
 * @property {Object} domains.blacklist - List of domains to block.
 * @property {Object} resourceTypes - .
 * @property {Object} resourceTypes.blacklist - List of resource types to block.
 */

/** @type {Config} */
export const config = {
  wait: 420,
  timeout: 12000,
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
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
};

export default config;
