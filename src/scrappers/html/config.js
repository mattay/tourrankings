/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {number} wait - Wait time in milliseconds.
 * @property {number} timeout - Timeout in milliseconds.
 * @property {Object} headers - HTTP headers.
 */

/** @type {Config} */
export const config = {
  wait: 420,
  timeout: 12000,
  headers: {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
  },
};

export default config;
