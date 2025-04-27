import { logError } from "./logging";

/**
 * Builds a URL with query parameters.
 * @param {string} baseUrl - The base URL to which the query parameters will be appended.
 * @param {Object} params - An object containing key-value pairs representing the query parameters.
 * @returns {string} The constructed URL with query parameters.
 */
export function buildUrl(baseUrl, params) {
  let queryString = "";
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      queryString += `${key}=${params[key]}&`;
    }
  }
  // Remove the trailing '&' character
  queryString = queryString.slice(0, -1);
  return `${baseUrl}?${queryString}`;
}

/**
 * Extracts sections of a URL's pathname based on provided labels.
 * @param {string} urlString - The URL to extract sections from.
 * @param {Array<string>} sectionLabels - An array of labels corresponding to sections of the URL's pathname.
 * @returns {Object|null} An object mapping each label to the corresponding section of the URL's pathname, or null if the number of labels does not match the number of sections.
 */
export function urlSections(urlString, sectionLabels = []) {
  if (!urlString || !sectionLabels) {
    logError(
      "urlSections",
      "Invalid input: urlString and sectionLabels are required",
    );
    return null;
  }

  const url = new URL(urlString);
  const pathname = url.pathname;
  // Remove empty results of splitting by "/"
  const parts = pathname.split("/").filter((part) => part.length > 0);
  if (sectionLabels.length != parts.length) {
    console.error("sectionLabels does not match path");
    console.error("sectionLables", sectionLabels);
    console.error("parts", parts);
    return null;
  }

  const sections = {};
  for (let label = 0; label < sectionLabels.length; label += 1) {
    const section = sectionLabels[label];
    sections[section] = parts[label];
  }

  return sections;
}
