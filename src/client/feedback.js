/**
 * Standalone Feedback Application
 * Designed to be loaded independently and cached across pages
 *
 * @typedef {Object} FeedbackConfig
 * @property {string} apiUrl - API endpoint for feedback submission
 * @property {number} timeout - Request timeout in milliseconds
 */

import { FeedbackManager } from "./components/feedback/FeedbackManager";

/**
 * Initialize the feedback application
 * This function can be called from any page that needs feedback functionality
 * @param {Partial<FeedbackConfig>} [config] - Optional configuration overrides
 * @returns {FeedbackManager} Feedback manager instance
 */
function initFeedback(config = {}) {
  const defaultConfig = {
    apiUrl: "/api/feedback",
    timeout: 10000,
  };

  const mergedConfig = { ...defaultConfig, ...config };
  return new FeedbackManager(mergedConfig);
}

// Auto-initialize if DOM is already loaded, or wait for it
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initFeedback());
} else {
  initFeedback();
}
