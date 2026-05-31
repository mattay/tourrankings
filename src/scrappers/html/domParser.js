import { parse } from "node-html-parser";

/**
 * Creates a getter for href that resolves relative URLs against a base URL.
 * This mimics JSDOM's behavior where element.href returns an absolute URL.
 *
 * @param {HTMLElement} element - The HTML element
 * @param {string} baseUrl - The base URL to resolve against
 * @returns {string|null} The absolute href or null
 */
function getResolvedHref(element, baseUrl) {
  const rawHref = element.getAttribute("href");
  if (!rawHref) return null;
  // If no baseUrl provided, return raw href (no resolution needed)
  if (!baseUrl) return rawHref;
  try {
    return new URL(rawHref, baseUrl).href;
  } catch {
    return rawHref;
  }
}

/**
 * Wraps an element to provide JSDOM-compatible property accessors.
 * Adds .href and .src getters that resolve relative URLs.
 *
 * @param {HTMLElement} element - The element to wrap
 * @param {string} baseUrl - The base URL for resolving relative URLs
 * @returns {HTMLElement} The wrapped element with additional getters
 */
function wrapElement(element, baseUrl) {
  // Only skip if element is missing or already wrapped
  // baseUrl can be undefined - getters will return raw attributes in that case
  if (!element || element._isWrapped) return element;

  // Mark as wrapped to avoid double-wrapping
  element._isWrapped = true;

  // Define href getter if not already present
  if (!Object.getOwnPropertyDescriptor(element, "href")) {
    Object.defineProperty(element, "href", {
      get: () => getResolvedHref(element, baseUrl),
      enumerable: true,
      configurable: true,
    });
  }

  // Define src getter if not already present
  if (!Object.getOwnPropertyDescriptor(element, "src")) {
    Object.defineProperty(element, "src", {
      get: () => {
        const rawSrc = element.getAttribute("src");
        if (!rawSrc) return null;
        // If no baseUrl provided, return raw src (no resolution needed)
        if (!baseUrl) return rawSrc;
        try {
          return new URL(rawSrc, baseUrl).href;
        } catch {
          return rawSrc;
        }
      },
      enumerable: true,
      configurable: true,
    });
  }

  return element;
}

/**
 * Wraps all elements in the DOM tree.
 *
 * @param {HTMLElement} root - The root element
 * @param {string} baseUrl - The base URL for resolving relative URLs
 */
function wrapAllElementsRecursive(root, baseUrl) {
  wrapElement(root, baseUrl);

  // Wrap all descendants using querySelectorAll
  if (root.querySelectorAll) {
    const allDescendants = root.querySelectorAll("*");
    for (const el of allDescendants) {
      wrapElement(el, baseUrl);
    }
  }
}

/**
 * Parses HTML content into a queryable DOM object using node-html-parser.
 * This is a lightweight alternative to JSDOM for static HTML parsing.
 *
 * @param {string} htmlContent - The HTML content to parse
 * @param {Object} [options] - Additional options for parsing
 * @param {string} [options.url] - The URL of the page being parsed (used as base for resolving relative URLs)
 * @returns {HTMLElement} The parsed HTML root element with querySelector/querySelectorAll methods
 */
export function htmlDOM(htmlContent, { url } = {}) {
  if (typeof htmlContent !== "string") {
    throw new TypeError("htmlContent must be a string");
  }

  // node-html-parser returns the root HTMLElement which has querySelector/querySelectorAll
  const root = parse(htmlContent, {
    lowerCaseTagName: false,
    comment: false,
    blockTextElements: {
      script: true,
      noscript: true,
      style: true,
      pre: true,
    },
  });

  // Determine base URL: use <base> tag if present, otherwise use passed URL
  let baseUrl = url;
  const baseTag = root.querySelector("base");
  if (baseTag) {
    const baseHref = baseTag.getAttribute("href");
    if (baseHref) {
      // Resolve relative base href against the original page URL
      // This handles cases like <base href="/race.php"> which needs
      // to be resolved against https://example.com/page to become absolute
      if (baseHref.match(/^https?:\/\//)) {
        // Absolute URL - use as-is
        baseUrl = baseHref;
      } else if (url) {
        // Relative URL and we have a base URL - resolve it
        baseUrl = new URL(baseHref, url).href;
      }
      // If baseHref is relative but no url provided, keep original url as baseUrl
    }
  }

  // Always attach URL reference and wrap all elements
  // This ensures .href/.src getters are always available, even if baseUrl is undefined
  root._sourceUrl = baseUrl;
  wrapAllElementsRecursive(root, baseUrl);

  return root;
}
