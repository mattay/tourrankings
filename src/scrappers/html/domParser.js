import { JSDOM } from "jsdom";

/**
 * Parses HTML content into a DOM object
 * @param {string} htmlContent - The HTML content to parse
 * @param {Object} [options] - Additional options for parsing
 * @param {string} [options.url] - The URL of the page being parsed
 * @returns {Document} The parsed DOM object
 */
export function htmlDOM(htmlContent, { url } = {}) {
  if (typeof htmlContent !== "string") {
    throw new TypeError("htmlContent must be a string");
  }
  const dom = new JSDOM(htmlContent, url ? { url } : undefined);
  const document = dom.window.document;

  // Attach cleanup method to release JSDOM memory
  document._closeDom = () => dom.window.close();

  return document;
}
