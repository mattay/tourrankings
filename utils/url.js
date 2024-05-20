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
