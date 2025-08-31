import { JSDOM } from "jsdom";

/**
 * Parses HTML content into a DOM object
 * @param {string} htmlContent - The HTML content to parse
 * @returns {Document} The parsed DOM object
 */
export function htmlDOM(htmlContent) {
  const dom = new JSDOM(htmlContent);
  return dom.window.document;
}
