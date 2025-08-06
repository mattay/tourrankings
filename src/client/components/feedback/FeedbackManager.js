/**
 * Feedback Manager - Handles all feedback form functionality
 * Designed as a self-contained module for easy reuse across pages
 *
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

import { getRaceInfoFromUrlPath } from "src/client/state/browser/location";

export class FeedbackManager {
  /** @type {Record<string, HTMLElement|null>} */
  _element = {};

  /** @type {boolean} */
  _isOpen = false;

  /** @type {boolean} */
  _isSubmitting = false;

  /** @type {Object} */
  config;

  // Store all element IDs in one place
  static ELEMENT_IDS = {
    toggle: "feedback-toggle",
    modal: "feedback-modal",
    btnClose: "feedback-close",
    form: "feedback-form",
    btnCancel: "feedback-cancel",
    btnSubmit: "feedback-submit",
    viewSuccess: "feedback-success",
    viewError: "feedback-error",
    btnDone: "feedback-done",
    btnRetry: "feedback-retry",
    errorMessage: "error-message",
  };

  /**
   * @param {Object} config - Configuration object
   * @param {string} config.apiUrl - API endpoint for feedback
   * @param {number} config.timeout - Request timeout in milliseconds
   */
  constructor(config) {
    this.config = config;
    this._initializeElements();
    if (!this._checkEssentials()) return; // No binding if essentials missing
    this._bindEvents();
  }

  /**
   * Initialize DOM elements with error handling
   * @returns {void}
   */
  _initializeElements() {
    for (const [key, id] of Object.entries(FeedbackManager.ELEMENT_IDS)) {
      this._element[key] = document.getElementById(id);
      if (!this._element[key] && key !== "errorMessage") {
        console.warn(`Feedback: Missing element with ID '${id}'`);
      }
    }
  }

  _checkEssentials() {
    const essentials = ["toggle", "modal", "form"];
    for (const key of essentials) {
      if (!this._element[key]) {
        console.error(
          `Feedback: Missing essential element '${key}'. Disabled.`,
        );
        return false;
      }
    }
    return true;
  }

  /**
   * Bind event listeners with null checks
   * @returns {void}
   */
  _bindEvents() {
    // Store handlers as arrow functions for easy remove in destroy()
    this._handlers = {
      open: () => this.openModal(),
      close: () => this.closeModal(),
      submit: (e) => this.handleSubmit(e),
      retry: () => this.showForm(),
      outsideClick: (e) => {
        if (e.target === this._element.modal) this.closeModal();
      },
      esc: (e) => {
        if (e.key === "Escape" && this._isOpen) this.closeModal();
      },
    };

    // Toggle feedback form
    this._element.toggle?.addEventListener("click", this._handlers.open);
    // Close modal events
    this._element.btnClose?.addEventListener("click", this._handlers.close);
    this._element.btnCancel?.addEventListener("click", this._handlers.close);
    this._element.btnDone?.addEventListener("click", this._handlers.close);
    // Form submission
    this._element.form?.addEventListener("submit", this._handlers.submit);
    // Retry button
    this._element.btnRetry?.addEventListener("click", this._handlers.retry);
    // Close on outside click
    this._element.modal?.addEventListener("click", this._handlers.outsideClick);
    document.addEventListener("keydown", this._handlers.esc);
  }

  /** Helper to show a set of elements
   * @param {HTMLElement[]} elements - Array of elements to show
   */
  _show(elements) {
    elements.forEach((el) => el?.classList.remove("is-hidden"));
  }

  /** Helper to hide a set of elements
   * @param {HTMLElement[]} elements - Array of elements to hide
   */
  _hide(elements) {
    elements.forEach((el) => el?.classList.add("is-hidden"));
  }

  /**
   * Open the feedback modal with accessibility focus management
   * @returns {void}
   */
  openModal() {
    if (!this._element.modal) return;
    this._isOpen = true;
    this._element.modal.classList.remove("is-hidden");
    this._element.modal.classList.add("active");
    this.showForm();

    // Focus first input for accessibility
    this._element.form?.querySelector("select, input, textarea")?.focus();
  }

  /**
   * Close the feedback modal with cleanup
   * @returns {void}
   */
  closeModal() {
    if (!this._element.modal) return;
    this._isOpen = false;
    this._element.modal.classList.remove("active");
    setTimeout(() => {
      this._element.modal.classList.add("is-hidden");
      this.resetForm();
    }, 300);
  }

  /**
   * Show the feedback form view
   * @returns {void}
   */
  showForm() {
    this._show([this._element.form]);
    this._hide([this._element.viewSuccess, this._element.viewError]);
  }

  /**
   * Show success message view
   * @returns {void}
   */
  showSuccess() {
    this._hide([this._element.form, this._element.viewError]);
    this._show([this._element.viewSuccess]);
  }

  /**
   * Show error message view with custom message
   * @param {string} message - Error message to display
   * @returns {void}
   */
  showError(message) {
    this._hide([this._element.form, this._element.viewSuccess]);
    this._show([this._element.viewError]);
    if (this._element.errorMessage)
      this._element.errorMessage.textContent = message;
  }

  /**
   * Reset form to initial state
   * @returns {void}
   */
  resetForm() {
    this._element.form?.reset();
    this._isSubmitting = false;
    this.updateSubmitButton(false);
    this.showForm();
  }

  /**
   * Update submit button loading state
   * @param {boolean} loading - Whether to show loading state
   * @returns {void}
   */
  updateSubmitButton(loading) {
    if (!this._element.btnSubmit) return;
    const btn = this._element.btnSubmit;
    const submitText = btn.querySelector(".submit-text");
    const submitLoading = btn.querySelector(".submit-loading");
    if (!submitText || !submitLoading) {
      console.warn("Feedback: Submit button markup incomplete");
      return;
    }
    btn.disabled = loading;
    btn.classList.toggle("sending", loading);
    submitText.classList.toggle("is-hidden", loading);
    submitLoading.classList.toggle("is-hidden", !loading);
  }

  /**
   * Handle form submission with error handling
   * @param {Event} event - Form submit event
   * @returns {Promise<void>}
   */
  async handleSubmit(event) {
    event.preventDefault();
    if (this._isSubmitting || !this._element.form) return;
    this._isSubmitting = true;
    this.updateSubmitButton(true);
    try {
      const formData = this.collectFormData();
      await this.submitFeedback(formData);
      this.showSuccess();
      setTimeout(() => this.closeModal(), 3000);
    } catch (error) {
      this.showError(error.message || "Please try again later.");
    } finally {
      this._isSubmitting = false;
      this.updateSubmitButton(false);
    }
  }

  /**
   * Helper to sanitize string values
   * @param {string} value - Value to sanitize
   * @returns {string} Sanitized value
   */
  sanitizeValue(value) {
    if (typeof value !== "string") return value;
    return value.replace(/[<>]/g, "");
  }

  /**
   * Collect form data with context information
   * @returns {FeedbackSubmissionData|{}} Form data object
   */
  collectFormData() {
    if (!this._element.form) return {};
    const { raceId, year, stage, classification } = getRaceInfoFromUrlPath();
    const data = {
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      raceId,
      year,
      stage,
      classification,
    };
    const formData = new FormData(this._element.form);
    for (let [k, v] of formData.entries()) {
      data[k] = this.sanitizeValue(v);
    }

    return data;
  }

  /**
   * Submit feedback to API with timeout handling
   * @param {FeedbackSubmissionData} data - Feedback data
   * @returns {Promise<Object>} API response
   */
  async submitFeedback(data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    try {
      const response = await fetch(this.config.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.message || `HTTP error! status: ${response.status}`,
        );
      }
      const result = await response.json();
      if (!result.success)
        throw new Error(result.message || "Submission failed");
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError")
        throw new Error("Request timed out. Please try again.");
      throw error;
    }
  }

  /**
   * Cleanup method for removing event listeners
   * @returns {void}
   */
  destroy() {
    // Remove event listeners using stored references
    this._element.toggle?.removeEventListener("click", this._handlers.open);
    this._element.btnClose?.removeEventListener("click", this._handlers.close);
    this._element.btnCancel?.removeEventListener("click", this._handlers.close);
    this._element.btnDone?.removeEventListener("click", this._handlers.close);
    this._element.form?.removeEventListener("submit", this._handlers.submit);
    this._element.btnRetry?.removeEventListener("click", this._handlers.retry);
    this._element.modal?.removeEventListener(
      "click",
      this._handlers.outsideClick,
    );
    document.removeEventListener("keydown", this._handlers.esc);
  }
}
