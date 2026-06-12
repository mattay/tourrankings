/**
 * HTML Cleaning Utilities
 * Removes style/script tags and attributes not needed for parsing
 */

/**
 * Cleans HTML by removing style/script tags and unnecessary attributes
 * @param {string} html - Raw HTML content
 * @returns {string} Cleaned HTML
 */
export function cleanHtml(html) {
  // Remove script tags and content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and content
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove inline style attributes
  html = html.replace(/\s*style="[^"]*"/gi, '');
  
  // Remove class attributes (optional - keep if needed for parsing)
  // html = html.replace(/\s*class="[^"]*"/gi, '');
  
  // Remove data-* attributes (optional)
  // html = html.replace(/\s*data-[a-z-]+="[^"]*"/gi, '');
  
  // Remove HTML comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove noscript tags
  html = html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  
  // Remove link tags (CSS includes)
  html = html.replace(/<link\b[^>]*>/gi, '');
  
  return html.trim();
}
