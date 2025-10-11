/**
 * Collection of cycling-themed error messages for various failure scenarios.
 * Each message represents a common cycling mishap that riders can relate to.
 */

/**
 * @typedef {Object} ErrorMessage
 * @property {string} html - HTML-formatted error message
 * @property {string} plain - Plain text version for logging
 */

export const ERROR_MESSAGES = {
  /**
   * No data available - like forgetting essentials
   * @type {ErrorMessage}
   */
  NO_DATA: {
    html: `
      <div class="oops-message">
        <h2>Oops... We've got a mechanical</h2>
        <p>Looks like we forgot to check our race data before heading out. Classic rookie mistake.</p>
        <p>We're fixing it now — promise we won't make you wait as long as that time someone forgot their spare tube was already punctured.</p>
        <p class="comeback">Check back soon, and we'll have the full calendar ready to roll.</p>
      </div>
    `,
    plain: "No race data available",
  },

  /**
   * Catastrophic failure - derailleur in spokes
   * @type {ErrorMessage}
   */
  CATASTROPHIC: {
    html: `
      <div class="oops-message">
        <h2>Oof... That's not good</h2>
        <p>The derailleur just went straight into the spokes. You know, like when your bike falls over mid-flat change and bends the hanger?</p>
        <p>Yeah, we're dealing with that kind of situation right now. Everything's properly mangled.</p>
        <p class="comeback">We're calling the support car. This might take a moment...</p>
      </div>
    `,
    plain: "Catastrophic system failure",
  },

  /**
   * General render error - chain ring marks
   * @type {ErrorMessage}
   */
  RENDER_ERROR: {
    html: `
      <div class="oops-message">
        <h2>Well, this is embarrassing.../h2>
        <p>We just got chain ring marks all over this page. Total amateur hour.</p>
        <p>The data dropped its chain harder than trying to shift under load. We're sorting it out.</p>
        <p class="comeback">Refresh in a bit—we'll try not to cross-chain this time.</p>
      </div>
    `,
    plain: "Unable to render page",
  },

  /**
   * Resource not found (404)
   * @type {ErrorMessage}
   */
  NOT_FOUND: {
    html: `
      <div class="oops-message">
        <h2>Wrong turn at the feed zone</h2>
        <p>We can't find what you're looking for. Must've missed the course markers.</p>
        <p>Happens to everyone — like that time you took the wrong exit on the group ride and had to chase back on.</p>
        <p class="comeback">Head back to the start and we'll get you sorted.</p>
      </div>
    `,
    plain: "Resource not found",
  },

  /**
   * Race not found
   * @type {ErrorMessage}
   */
  RACE_NOT_FOUND: {
    html: `
      <div class="oops-message">
        <h2>Can't find that race</h2>
        <p>Either we're looking at the wrong calendar, or this race doesn't exist yet.</p>
        <p>It's like showing up to the start line on the wrong day. We've all been there.</p>
        <p class="comeback">Double-check the race name and year, and let's try again.</p>
      </div>
    `,
    plain: "Race not found",
  },

  /**
   * Stage not found
   * @type {ErrorMessage}
   */
  STAGE_NOT_FOUND: {
    html: `
      <div class="oops-message">
        <h2>That stage doesn't exist yet</h2>
        <p>You're trying to check results for a stage that hasn't happened. We admire the enthusiasm!</p>
        <p>It's like asking "who won?" before the race even starts. Patience, grasshopper.</p>
        <p class="comeback">Check back after the stage finishes, or pick an earlier one.</p>
      </div>
    `,
    plain: "Stage not found",
  },

  /**
   * Invalid stage data
   * @type {ErrorMessage}
   */
  INVALID_STAGE: {
    html: `
      <div class="oops-message">
        <h2>Something's off with this stage</h2>
        <p>The stage data looks about as reliable as a worn-out chain. We've got gaps and inconsistencies.</p>
        <p>Like trying to read your GPS after it's been tracking your pocket for 20 minutes.</p>
        <p class="comeback">We're cleaning up the data. Try another stage for now.</p>
      </div>
    `,
    plain: "Invalid stage data",
  },

  /**
   * Missing results data
   * @type {ErrorMessage}
   */
  NO_RESULTS: {
    html: `
      <div class="oops-message">
        <h2>Results are MIA</h2>
        <p>We're still waiting on the results to come through. It's like standing at the finish line but all the riders took a detour.</p>
        <p>Could be the timing system bonked harder than a rider on a long climb without nutrition.</p>
        <p class="comeback">Give us a few minutes to chase down those results.</p>
      </div>
    `,
    plain: "Results data not available",
  },

  /**
   * Data scraping failure
   * @type {ErrorMessage}
   */
  SCRAPING_FAILED: {
    html: `
      <div class="oops-message">
        <h2>Data collection flatted out /h2>
        <p>Our data scraper just pinch-flatted trying to gather the latest info. Must've hit a pothole in the API.</p>
        <p>We're patching it up now. At least we didn't forget to bring the pump this time.</p>
        <p class="comeback">Should be rolling again shortly. Thanks for your patience!</p>
      </div>
    `,
    plain: "Data scraping failed",
  },

  /**
   * Invalid classification type
   * @type {ErrorMessage}
   */
  INVALID_CLASSIFICATION: {
    html: `
      <div class="oops-message">
        <h2>That jersey doesn't exist</h2>
        <p>You're looking for a classification that's not in this race. It's like asking for the lanterne rouge at a one-day classic.</p>
        <p>Stick to the jerseys they're actually racing for, yeah?</p>
        <p class="comeback">Check the available classifications and pick one of those.</p>
      </div>
    `,
    plain: "Invalid classification type",
  },

  /**
   * Network/timeout error
   * @type {ErrorMessage}
   */
  TIMEOUT: {
    html: `
      <div class="oops-message">
        <h2>Running out of steam...</h2>
        <p>The request is taking longer than a solo breakaway with 100km to go. Not looking good.</p>
        <p>Might be time to sit up and try again. Even Pogačar needs a breather sometimes.</p>
        <p class="comeback">Give it another shot in a moment.</p>
      </div>
    `,
    plain: "Request timeout",
  },

  /**
   * Database connection error
   * @type {ErrorMessage}
   */
  DB_CONNECTION: {
    html: `
      <div class="oops-message">
        <h2>Lost the wheel</h2>
        <p>Our connection to the database just got dropped like a rider who can't hold the pace on a climb.</p>
        <p>We're trying to chase back on, but it might take a lap or two.</p>
        <p class="comeback">Sit tight while we bridge the gap.</p>
      </div>
    `,
    plain: "Database connection failed",
  },

  /**
   * Invalid year parameter
   * @type {ErrorMessage}
   */
  INVALID_YEAR: {
    html: `
      <div class="oops-message">
        <h2>Time traveling now?</h2>
        <p>That year doesn't look right. We've got race data, but not from the distant past or far future.</p>
        <p>It's like trying to sign up for the 1903 Tour de France. Good luck with that.</p>
        <p class="comeback">Try a year we actually have data for.</p>
      </div>
    `,
    plain: "Invalid year parameter",
  },

  /**
   * Rate limit exceeded
   * @type {ErrorMessage}
   */
  RATE_LIMIT: {
    html: `
      <div class="oops-message">
        <h2>Whoa there, ease up rider!</h2>
        <p>You're refreshing faster than a sprinter's legs in the final 200 meters. Impressive, but let's dial it back a bit.</p>
        <p>Even Cavendish takes a breather between efforts.</p>
        <p class="comeback">Take a quick rest and try again in a moment.</p>
      </div>
    `,
    plain: "Rate limit exceeded",
  },
};

/**
 * Get an error message by key
 * @param {keyof typeof ERROR_MESSAGES} key - The error message key
 * @returns {ErrorMessage}
 */
export function getErrorMessage(key) {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.CATASTROPHIC;
}

/**
 * Get HTML error message
 * @param {keyof typeof ERROR_MESSAGES} key - The error message key
 * @returns {string} HTML formatted error message
 */
export function getErrorHTML(key) {
  return getErrorMessage(key).html;
}

/**
 * Get plain text error message (for logging)
 * @param {keyof typeof ERROR_MESSAGES} key - The error message key
 * @returns {string} Plain text error message
 */
export function getErrorText(key) {
  return getErrorMessage(key).plain;
}
