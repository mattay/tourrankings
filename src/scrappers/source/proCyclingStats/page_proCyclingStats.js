import { logError } from "src/utils/logging";
import config from "./config";

/**
 * Enhanced request interceptor to block unnecessary resources and reduce bandwidth/memory usage
 * @param {import('puppeteer-core').HTTPRequest} request - Puppeteer request object
 * @returns {void}
 */
export function interceptRequests(request) {
  // Safety check - don't handle twice
  if (request.isInterceptResolutionHandled()) {
    return;
  }

  try {
    const url = request.url();
    const resourceType = request.resourceType();
    const hostname = new URL(url).hostname;

    // Determine if we should block this request
    let shouldBlock = false;

    // Check 1: Resource type blacklist
    if (config.resourceTypes.blacklist.includes(resourceType)) {
      shouldBlock = true;
    }
    // Check 2: Domain blacklist
    else if (
      config.domains.blacklist.some(
        (d) => hostname === d || hostname.endsWith("." + d),
      )
    ) {
      shouldBlock = true;
    }
    // Check 3: Whitelist (if exists)
    else if (config.domains.whitelist && config.domains.whitelist.length > 0) {
      const isWhitelisted = config.domains.whitelist.some(
        (d) => hostname === d || hostname.endsWith("." + d),
      );
      if (!isWhitelisted) {
        shouldBlock = true;
      }
    }

    // Single decision point
    if (shouldBlock) {
      request.abort();
    } else {
      request.continue();
    }
  } catch (error) {
    // If there's any error parsing URL, allow the request to avoid breaking navigation
    logError(
      "interceptRequests",
      "Failed to handle intercepted request",
      error,
    );
    if (!request.isInterceptResolutionHandled()) {
      request.continue();
    }
  }
}
