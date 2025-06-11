import { logError, logOut } from "../../src/utils/logging.js";
import { googleSheetsService } from "../../src/services/google/googleSheetsService.js";

/**
 * @typedef {Object} FeedbackData
 * @property {string} feedbackType - Type of feedback (bug, feature-request, etc.)
 * @property {string} message - Feedback message content
 * @property {string} [userEmail] - Optional user email for response
 * @property {string} pageUrl - Current page URL
 * @property {string} userAgent - Browser user agent
 * @property {string} timestamp - Submission timestamp
 * @property {string} [raceId] - Race ID if on race page
 * @property {number} [year] - Year if on race page
 * @property {string} [stage] - Stage number if applicable
 * @property {string} [classification] - Classification if applicable
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether the data is valid
 * @property {string[]} errors - Array of validation error messages
 */

/**
 * Configuration for feedback handling
 */
const FEEDBACK_CONFIG = {
  requiredFields: ["feedbackType", "message", "pageUrl"],
  maxMessageLength: 2000,
  validFeedbackTypes: [
    "bug",
    "data-error",
    "feature-request",
    "general",
    "praise",
  ],
};

/**
 * Validates feedback data
 * @param {FeedbackData} data - The feedback data to validate
 * @returns {ValidationResult} Validation result
 */
function validateFeedbackData(data) {
  const errors = [];

  // Check required fields
  FEEDBACK_CONFIG.requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors.push(`${field} is required`);
    }
  });

  // Validate feedback type
  if (
    data.feedbackType &&
    !FEEDBACK_CONFIG.validFeedbackTypes.includes(data.feedbackType)
  ) {
    errors.push("Invalid feedback type");
  }

  // Validate message length
  if (data.message && data.message.length > FEEDBACK_CONFIG.maxMessageLength) {
    errors.push(
      `Message cannot exceed ${FEEDBACK_CONFIG.maxMessageLength} characters`,
    );
  }

  // Validate email format if provided
  if (data.userEmail && data.userEmail.trim() !== "") {
    //TODO: Consider using a validation library like validator.js for more robust email validation.
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(data.userEmail)) {
      errors.push("Invalid email format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes feedback data to prevent XSS and other security issues
 * @param {FeedbackData} data - Raw feedback data
 * @returns {FeedbackData} Sanitized feedback data
 */
function sanitizeFeedbackData(data) {
  const sanitized = {};

  // Basic string sanitization (remove/escape potentially dangerous characters)
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str
      .replace(/[<>]/g, "") // Remove < and > characters
      .replace(/javascript:/gi, "") // Remove javascript: protocol
      .trim();
  };

  // Sanitize all string fields
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "string") {
      sanitized[key] = sanitizeString(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  });

  // Ensure timestamp is valid ISO string
  if (sanitized.timestamp) {
    try {
      const date = new Date(sanitized.timestamp);
      sanitized.timestamp = date.toISOString();
    } catch (error) {
      sanitized.timestamp = new Date().toISOString();
    }
  } else {
    sanitized.timestamp = new Date().toISOString();
  }

  return sanitized;
}

/**
 * Processes and stores feedback data
 * @param {FeedbackData} data - Validated and sanitized feedback data
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
async function processFeedback(data) {
  try {
    // Write to Google Sheets
    const result = await googleSheetsService.writeFeedback(data);

    if (result.success) {
      return {
        success: true,
        id: `feedback_${result.rowId || Date.now()}`,
      };
    } else {
      throw new Error(result.error || "Failed to write to Google Sheets");
    }
  } catch (error) {
    logError("Feedback", "Failed to process feedback", error);
    return {
      success: false,
      error: "Failed to process feedback",
    };
  }
}

/**
 * Handles POST request for feedback submission
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {Promise<void>}
 */
export async function submitFeedback(req, res) {
  try {
    // Validate request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is required",
      });
    }

    // Sanitize the input data
    const sanitizedData = sanitizeFeedbackData(req.body);

    // Validate the feedback data
    const validation = validateFeedbackData(sanitizedData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // Process the feedback
    const result = await processFeedback(sanitizedData);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Feedback submitted successfully",
        id: result.id,
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.error ?? "Failed to process feedback",
      });
    }
  } catch (error) {
    logError("FeedbackController", "Error in submitFeedback", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

/**
 * Handles GET request for feedback status/health check
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @returns {void}
 */
export function getFeedbackStatus(req, res) {
  res.status(200).json({
    success: true,
    message: "Feedback API is operational",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
}
