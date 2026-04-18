/**
 * API client for feedback functionality
 */

/**
 * @typedef {Object} FeedbackSubmissionData
 * @property {string} feedbackType - Type of feedback (bug, feature-request, etc.)
 * @property {string} message - Feedback message content
 * @property {string} [userEmail] - Optional user email for response
 * @property {string} pageUrl - Current page URL
 * @property {string} userAgent - Browser user agent
 * @property {string} timestamp - Submission timestamp
 * @property {string} [raceId] - Race ID if on race page
 * @property {string} [stage] - Stage number if applicable
 */

/**
 * @typedef {Object} FeedbackResponse
 * @property {boolean} success - Whether the submission was successful
 * @property {string} message - Response message
 * @property {string} [id] - Feedback ID if successful
 * @property {string[]} [errors] - Validation errors if any
 */

/**
 * Submit feedback to the server
 * @param {FeedbackSubmissionData} feedbackData - The feedback data to submit
 * @returns {Promise<FeedbackResponse>} The server response
 */
export async function submitFeedback(feedbackData) {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedbackData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

/**
 * Check feedback API status
 * @returns {Promise<Object>} API status response
 */
export async function getFeedbackStatus() {
  try {
    const response = await fetch("/api/feedback");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error checking feedback status:", error);
    throw error;
  }
}
