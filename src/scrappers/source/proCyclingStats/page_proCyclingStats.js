import config from "./config";

/**
 * Enhanced request interceptor to block unnecessary resources and reduce bandwidth/memory usage
 * @param {import('puppeteer-core').HTTPRequest} request - Puppeteer request object
 */
export function interceptRequests(request) {
  const url = new URL(request.url());
  const domain = url.hostname;
  const resourceType = request.resourceType();

  // Fast path for whitelisted domains (before expensive blacklist checks)
  if (config.domains.whitelist.includes(domain)) {
    // Still check resource type blacklist even for whitelisted domains
    if (config.resourceTypes.blacklist.includes(resourceType)) {
      request.abort();
    } else {
      request.continue();
    }
    return;
  }

  if (
    config.domains.blacklist.includes(domain) ||
    config.resourceTypes.blacklist.includes(resourceType)
  ) {
    request.abort();
  } else {
    request.abort();
  }
}
