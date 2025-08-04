import config from "./config";

/**
 * Enhanced request interceptor to block unnecessary resources and reduce bandwidth/memory usage
 * @param {import('puppeteer-core').HTTPRequest} request - Puppeteer request object
 */
export function interceptRequests(request) {
  const url = new URL(request.url());
  const domain = url.hostname;
  const resourceType = request.resourceType();

  if (
    config.domains.blacklist.includes(domain) ||
    config.resourceTypes.blacklist.includes(resourceType)
  ) {
    request.abort();
  } else if (config.domains.whitelist.includes(domain)) {
    request.continue();
  } else {
    request.abort();
  }
}
