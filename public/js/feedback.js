(() => {
  // src/core/cycling/classification/classification.js
  var CALCULATION_TYPES = Object.freeze({
    STAGE_POSITION: "stage_position",
    ACCUMULATED_POINTS: "accumulated_points",
    ACCUMULATED_TIME: "accumulated_time",
    TEAM_TIME: "team_time"
  });
  var CLASSIFICATION_TYPES = Object.freeze({
    STAGE: "stage",
    GENERAL: "general",
    POINTS: "points",
    MOUNTAIN: "mountain",
    YOUTH: "youth",
    TEAM: "team"
  });
  var CLASSIFICATION_CONFIG = Object.freeze({
    [CLASSIFICATION_TYPES.STAGE]: {
      label: "Stage",
      calculationType: CALCULATION_TYPES.STAGE_POSITION,
      description: "Position at finish line for individual stage completion",
      teamBased: false
    },
    [CLASSIFICATION_TYPES.GENERAL]: {
      label: "General",
      calculationType: CALCULATION_TYPES.ACCUMULATED_TIME,
      description: "Total stage completion time minus bonifications, accumulated across all stages",
      teamBased: false
    },
    [CLASSIFICATION_TYPES.POINTS]: {
      label: "Points",
      calculationType: CALCULATION_TYPES.ACCUMULATED_POINTS,
      description: "Points collected at designated locations during and/or at end of stages",
      teamBased: false
    },
    [CLASSIFICATION_TYPES.MOUNTAIN]: {
      label: "Mountain",
      calculationType: CALCULATION_TYPES.ACCUMULATED_POINTS,
      description: "Points collected at mountain/climb locations, may include bonifications for time-based classifications",
      teamBased: false
    },
    [CLASSIFICATION_TYPES.YOUTH]: {
      label: "Youth",
      calculationType: CALCULATION_TYPES.ACCUMULATED_TIME,
      description: "Same as General Classification but restricted to riders under 25 years old",
      teamBased: false,
      ageRestriction: 25
    },
    [CLASSIFICATION_TYPES.TEAM]: {
      label: "Team",
      calculationType: CALCULATION_TYPES.TEAM_TIME,
      description: "Sum of top 3 riders' accumulated times per team",
      teamBased: true
    }
  });
  var CLASSIFICATION_UI_OPTIONS = Object.entries(CLASSIFICATION_CONFIG).map(([type, config]) => ({
    type,
    label: config.label
  }));
  function isValidClassificationType(classificationType) {
    if (typeof classificationType !== "string") {
      return false;
    }
    return Object.values(CLASSIFICATION_TYPES).includes(classificationType);
  }
  function validateClassification(classification, fallbackClassification = CLASSIFICATION_TYPES.GENERAL) {
    if (classification === undefined || classification === null) {
      return fallbackClassification;
    }
    if (!isValidClassificationType(classification)) {
      console.warn(`Classification type "${classification}" is not valid.`);
      return fallbackClassification;
    }
    return classification;
  }

  // src/core/cycling/stage/stage.js
  function validateStage(stage, fallbackStage = 1) {
    if (stage === undefined || stage === null || stage === "") {
      return fallbackStage;
    }
    const stageNumber = Number(stage);
    if (!Number.isInteger(stageNumber) || stageNumber < 0) {
      console.warn("Invalid stage number", stageNumber);
      return fallbackStage;
    }
    return stageNumber;
  }

  // src/utils/date.js
  var YEAR_MIN = 1900;
  function validateYear(yearParam, fallbackYear = new Date().getFullYear()) {
    const currentYear = new Date().getFullYear();
    const dynamicMax = currentYear + 5;
    let safeFallback = Number.isInteger(fallbackYear) ? fallbackYear : currentYear;
    if (safeFallback < YEAR_MIN)
      safeFallback = YEAR_MIN;
    if (safeFallback > dynamicMax)
      safeFallback = dynamicMax;
    if (yearParam === undefined || yearParam === null || String(yearParam).trim() === "") {
      return safeFallback;
    }
    const year = Number(yearParam);
    if (Number.isInteger(year) && year >= YEAR_MIN && year <= dynamicMax) {
      return year;
    }
    return safeFallback;
  }

  // src/client/state/browser/location.js
  function getRaceInfoFromUrlPath() {
    const pathParts = window.location.pathname.split("/").filter((part) => part);
    const root = pathParts[0];
    const raceId = pathParts[1];
    const year = validateYear(pathParts.length > 2 ? parseInt(pathParts[2]) : null);
    const stage = validateStage(pathParts.length > 3 ? parseInt(pathParts[3]) : null);
    const classification = validateClassification(pathParts.length > 4 ? pathParts[4] : null);
    return {
      root,
      raceId,
      year,
      stage,
      classification
    };
  }

  // src/client/components/feedback/FeedbackManager.js
  class FeedbackManager {
    _element = {};
    _isOpen = false;
    _isSubmitting = false;
    config;
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
      errorMessage: "error-message"
    };
    constructor(config) {
      this.config = config;
      this._initializeElements();
      if (!this._checkEssentials())
        return;
      this._bindEvents();
    }
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
          console.error(`Feedback: Missing essential element '${key}'. Disabled.`);
          return false;
        }
      }
      return true;
    }
    _bindEvents() {
      this._handlers = {
        open: () => this.openModal(),
        close: () => this.closeModal(),
        submit: (e) => this.handleSubmit(e),
        retry: () => this.showForm(),
        outsideClick: (e) => {
          if (e.target === this._element.modal)
            this.closeModal();
        },
        esc: (e) => {
          if (e.key === "Escape" && this._isOpen)
            this.closeModal();
        }
      };
      this._element.toggle?.addEventListener("click", this._handlers.open);
      this._element.btnClose?.addEventListener("click", this._handlers.close);
      this._element.btnCancel?.addEventListener("click", this._handlers.close);
      this._element.btnDone?.addEventListener("click", this._handlers.close);
      this._element.form?.addEventListener("submit", this._handlers.submit);
      this._element.btnRetry?.addEventListener("click", this._handlers.retry);
      this._element.modal?.addEventListener("click", this._handlers.outsideClick);
      document.addEventListener("keydown", this._handlers.esc);
    }
    _show(elements) {
      elements.forEach((el) => el?.classList.remove("is-hidden"));
    }
    _hide(elements) {
      elements.forEach((el) => el?.classList.add("is-hidden"));
    }
    openModal() {
      if (!this._element.modal)
        return;
      this._isOpen = true;
      this._element.modal.classList.remove("is-hidden");
      this._element.modal.classList.add("active");
      this.showForm();
      this._element.form?.querySelector("select, input, textarea")?.focus();
    }
    closeModal() {
      if (!this._element.modal)
        return;
      this._isOpen = false;
      this._element.modal.classList.remove("active");
      setTimeout(() => {
        this._element.modal.classList.add("is-hidden");
        this.resetForm();
      }, 300);
    }
    showForm() {
      this._show([this._element.form]);
      this._hide([this._element.viewSuccess, this._element.viewError]);
    }
    showSuccess() {
      this._hide([this._element.form, this._element.viewError]);
      this._show([this._element.viewSuccess]);
    }
    showError(message) {
      this._hide([this._element.form, this._element.viewSuccess]);
      this._show([this._element.viewError]);
      if (this._element.errorMessage)
        this._element.errorMessage.textContent = message;
    }
    resetForm() {
      this._element.form?.reset();
      this._isSubmitting = false;
      this.updateSubmitButton(false);
      this.showForm();
    }
    updateSubmitButton(loading) {
      if (!this._element.btnSubmit)
        return;
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
    async handleSubmit(event) {
      event.preventDefault();
      if (this._isSubmitting || !this._element.form)
        return;
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
    sanitizeValue(value) {
      if (typeof value !== "string")
        return value;
      return value.replace(/[<>]/g, "");
    }
    collectFormData() {
      if (!this._element.form)
        return {};
      const { raceId, year, stage, classification } = getRaceInfoFromUrlPath();
      const data = {
        pageUrl: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        raceId,
        year,
        stage,
        classification
      };
      const formData = new FormData(this._element.form);
      for (let [k, v] of formData.entries()) {
        data[k] = this.sanitizeValue(v);
      }
      return data;
    }
    async submitFeedback(data) {
      const controller = new AbortController;
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      try {
        const response = await fetch(this.config.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.message || `HTTP error! status: ${response.status}`);
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
    destroy() {
      this._element.toggle?.removeEventListener("click", this._handlers.open);
      this._element.btnClose?.removeEventListener("click", this._handlers.close);
      this._element.btnCancel?.removeEventListener("click", this._handlers.close);
      this._element.btnDone?.removeEventListener("click", this._handlers.close);
      this._element.form?.removeEventListener("submit", this._handlers.submit);
      this._element.btnRetry?.removeEventListener("click", this._handlers.retry);
      this._element.modal?.removeEventListener("click", this._handlers.outsideClick);
      document.removeEventListener("keydown", this._handlers.esc);
    }
  }

  // src/client/feedback.js
  function initFeedback(config = {}) {
    const defaultConfig = {
      apiUrl: "/api/feedback",
      timeout: 1e4
    };
    const mergedConfig = { ...defaultConfig, ...config };
    return new FeedbackManager(mergedConfig);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initFeedback());
  } else {
    initFeedback();
  }
})();

//# debugId=9397FFBE9787F16A64756E2164756E21
//# sourceMappingURL=feedback.js.map
