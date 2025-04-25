import config from "./config";

/**
 *
 * @param {Handler<HTTPRequest} request
 */
export function interceptRequests(request) {
  const url = new URL(request.url());
  const domain = url.hostname;

  if (config.domains.whitelist.includes(domain)) {
    request.continue();
  } else {
    request.abort();
  }
}
