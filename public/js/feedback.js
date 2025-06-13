/**
 * Feedback form functionality
 * Handles form submission to internal server API
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
 * Configuration for the feedback system
 * @typedef {Object} FeedbackConfig
 * @property {string} apiUrl - Internal API endpoint for feedback
 * @property {number} timeout - Request timeout in milliseconds
 */
const FEEDBACK_CONFIG = {
  apiUrl: "/api/feedback", // Internal server endpoint
  timeout: 10000, // 10 seconds
};

/**
 * Feedback form manager class
 */
class FeedbackManager {
  constructor() {
    this.isOpen = false;
    this.isSubmitting = false;
    this.initializeElements();
    this.bindEvents();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    this.container = document.getElementById("feedback-container");
    this.toggle = document.getElementById("feedback-toggle");
    this.modal = document.getElementById("feedback-modal");
    this.closeBtn = document.getElementById("feedback-close");
    this.form = document.getElementById("feedback-form");
    this.cancelBtn = document.getElementById("feedback-cancel");
    this.submitBtn = document.getElementById("feedback-submit");
    this.successView = document.getElementById("feedback-success");
    this.errorView = document.getElementById("feedback-error");
    this.doneBtn = document.getElementById("feedback-done");
    this.retryBtn = document.getElementById("feedback-retry");
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Toggle feedback form
    this.toggle?.addEventListener("click", () => this.openModal());

    // Close modal events
    this.closeBtn?.addEventListener("click", () => this.closeModal());
    this.cancelBtn?.addEventListener("click", () => this.closeModal());
    this.doneBtn?.addEventListener("click", () => this.closeModal());

    // Form submission
    this.form?.addEventListener("submit", (e) => this.handleSubmit(e));

    // Retry button
    this.retryBtn?.addEventListener("click", () => this.showForm());

    // Close on outside click
    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    });

    // Close on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closeModal();
      }
    });
  }

  /**
   * Open the feedback modal
   */
  openModal() {
    this.isOpen = true;
    this.modal.style.display = "flex";
    this.modal.classList.add("active");
    this.showForm();

    // Focus first input
    const firstInput = this.form?.querySelector("select, input, textarea");
    firstInput?.focus();
  }

  /**
   * Close the feedback modal
   */
  closeModal() {
    this.isOpen = false;
    this.modal.classList.remove("active");
    setTimeout(() => {
      this.modal.style.display = "none";
      this.resetForm();
    }, 300);
  }

  /**
   * Show the feedback form
   */
  showForm() {
    this.form.style.display = "flex";
    this.successView.style.display = "none";
    this.errorView.style.display = "none";
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.form.style.display = "none";
    this.successView.style.display = "flex";
    this.errorView.style.display = "none";
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    this.form.style.display = "none";
    this.successView.style.display = "none";
    this.errorView.style.display = "flex";

    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
      errorMessage.textContent = message;
    }
  }

  /**
   * Reset the form to initial state
   */
  resetForm() {
    this.form?.reset();
    this.isSubmitting = false;
    this.updateSubmitButton(false);
    this.showForm();
  }

  /**
   * Update submit button state
   * @param {boolean} loading - Whether to show loading state
   */
  updateSubmitButton(loading) {
    if (!this.submitBtn) return;

    const submitText = this.submitBtn.querySelector(".submit-text");
    const submitLoading = this.submitBtn.querySelector(".submit-loading");

    if (loading) {
      this.submitBtn.disabled = true;
      this.submitBtn.classList.add("sending");
      submitText.style.display = "none";
      submitLoading.style.display = "inline";
    } else {
      this.submitBtn.disabled = false;
      this.submitBtn.classList.remove("sending");
      submitText.style.display = "inline";
      submitLoading.style.display = "none";
    }
  }

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  async handleSubmit(e) {
    e.preventDefault();

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.updateSubmitButton(true);

    try {
      const formData = this.collectFormData();
      await this.submitFeedback(formData);
      this.showSuccess();

      // Auto-close after 3 seconds
      setTimeout(() => this.closeModal(), 3000);
    } catch (error) {
      console.error("Feedback submission error:", error);
      this.showError(error.message || "Please try again later.");
    } finally {
      this.isSubmitting = false;
      this.updateSubmitButton(false);
    }
  }

  /**
   * Collect form data including context
   * @returns {Object} Form data object
   */
  collectFormData() {
    const formData = new FormData(this.form);
    const data = {};

    // Collect form fields
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }

    // Add context data
    data.pageUrl = window.location.href;
    data.userAgent = navigator.userAgent;
    data.timestamp = new Date().toISOString();

    // Add race-specific context if available
    const raceId = this.extractRaceId();
    if (raceId) {
      data.raceId = raceId;
    }

    const stage = this.extractStage();
    if (stage) {
      data.stage = stage;
    }

    return data;
  }

  /**
   * Extract race ID from current URL
   * @returns {string|null} Race ID or null
   */
  extractRaceId() {
    const match = window.location.pathname.match(/\/race\/([^\/]+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract stage from current URL or page content
   * @returns {string|null} Stage number or null
   */
  extractStage() {
    const urlMatch = window.location.pathname.match(
      /\/race\/[^\/]+\/\d+\/(\d+)/,
    );
    if (urlMatch) return urlMatch[1];

    const stageElement = document.getElementById("stage-number");
    return stageElement?.textContent?.trim() || null;
  }

  /**
   * Submit feedback to internal server API
   * @param {Object} data - Feedback data
   * @returns {Promise} Submission promise
   */
  async submitFeedback(data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      FEEDBACK_CONFIG.timeout,
    );

    try {
      const response = await fetch(FEEDBACK_CONFIG.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Submission failed");
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }

      throw error;
    }
  }
}

// Initialize feedback manager when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new FeedbackManager();
});
