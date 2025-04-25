/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {Object} browser - Browser configuration options.
 * @property {Object} domains - .
 * @property {Object} domains.whitelist - List of domains to allow.
 * @property {Object} domains.blacklist - List of domains to block.
 *
 */

/** @type {Config} */
const config = {
  browser: {
    headless: true,
    defaultViewport: null,
  },
  domains: {
    whitelist: [
      "www.procyclingstats.com",
      "ajax.googleapis.com",
      "code.jquery.com",
    ],
    blacklist: [],
  },
  wait: 420,
};
export default config;
