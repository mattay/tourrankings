import { google } from "googleapis";
import { logError, logOut } from "../../utils/logging.js";

/**
 * Configuration for Google Sheets integration
 * @typedef {Object} SheetsConfig
 * @property {string} spreadsheetId - Google Sheets spreadsheet ID
 * @property {string} sheetName - Name of the worksheet
 * @property {string[]} headers - Column headers for the sheet
 */
const SHEETS_CONFIG = {
  spreadsheetId: process.env.GOOGLE_SHEETS_ID, // Set this in your environment
  sheetName: "Feedback",
  headers: [
    "Check Box",
    "Timestamp",
    "Page URL",
    "Feedback Type",
    "Message",
    "User Email",
    "User Agent",
    "Viewing Race ID",
    "Viewing Year",
    "Viewing Stage",
    "Viewing Classification",
  ],
};

/**
 * Converts a column index to A1 notation column letter(s)
 * @param {number} index - 0-based column index
 * @returns {string} Column letter(s) (e.g., 'A', 'Z', 'AA', 'AB')
 */
function getColumnLetter(index) {
  let letter = "";
  while (index >= 0) {
    letter = String.fromCharCode((index % 26) + 65) + letter;
    index = Math.floor(index / 26) - 1;
  }
  return letter;
}

/**
 * Google Sheets service class
 */
class ServiceGoogleSheets {
  constructor() {
    this.sheets = null;
    this.auth = null;
  }

  /**
   * Initialize Google Sheets API client
   * @returns {Promise<void>}
   */
  async initialize() {
    logOut(this.constructor.name, "initializing...");
    try {
      // Use multiple authentication methods in priority order
      const authConfig = {
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      };

      // Priority 1: Explicit JSON credentials from environment (if keys are allowed)
      if (process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS) {
        authConfig.credentials = JSON.parse(
          process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
        );
        logOut(
          this.constructor.name,
          "Using explicit service account credentials",
        );
      }
      // Priority 2: Key file path (if keys are allowed)
      else if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
        authConfig.keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE;
        logOut(this.constructor.name, "Using service account key file");
      }
      // Priority 3: Application Default Credentials (ADC) - works without keys
      else {
        logError(
          this.constructor.name,
          "Using Application Default Credentials (no explicit credentials provided)",
        );
        // No explicit credentials - will use ADC
      }

      this.auth = new google.auth.GoogleAuth(authConfig);
      this.sheets = google.sheets({ version: "v4", auth: this.auth });

      // Verify connection and ensure sheet exists
      await this.ensureSheetExists();

      logOut(
        this.constructor.name,
        "Successfully initialized Google Sheets service",
      );
    } catch (error) {
      logError(
        this.constructor.name,
        "Failed to initialize Google Sheets service",
        error,
      );
      throw error;
    }
  }

  /**
   * Ensures the feedback sheet exists with proper headers
   * @returns {Promise<void>}
   */
  async ensureSheetExists() {
    try {
      // First, try to get the spreadsheet metadata
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
      });

      // Check if our sheet exists
      const sheet = spreadsheet.data.sheets?.find(
        (s) => s.properties?.title === SHEETS_CONFIG.sheetName,
      );

      if (!sheet) {
        // Create the sheet
        await this.createSheet();
      } else {
        // Verify headers exist
        await this.verifyHeaders();
      }
    } catch (error) {
      logError(this.constructor.name, "Error ensuring sheet exists", error);
      throw error;
    }
  }

  /**
   * Creates a new sheet with headers
   * @returns {Promise<void>}
   */
  async createSheet() {
    try {
      // Add the new sheet
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: SHEETS_CONFIG.sheetName,
                },
              },
            },
          ],
        },
      });

      // Add headers
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        range: `${SHEETS_CONFIG.sheetName}!A1:${getColumnLetter(SHEETS_CONFIG.headers.length - 1)}1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [SHEETS_CONFIG.headers],
        },
      });

      // Format headers
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: await this.getSheetId(),
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: SHEETS_CONFIG.headers.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.88, green: 0.96, blue: 0.99 },
                    textFormat: { bold: true },
                  },
                },
                fields: "userEnteredFormat(backgroundColor,textFormat)",
              },
            },
          ],
        },
      });

      logOut(this.constructor.name, "Created new feedback sheet with headers");
    } catch (error) {
      logError(this.constructor.name, "Error creating sheet", error);
      throw error;
    }
  }

  /**
   * Gets the sheet ID for the feedback sheet
   * @returns {Promise<number>}
   */
  async getSheetId() {
    const spreadsheet = await this.sheets.spreadsheets.get({
      spreadsheetId: SHEETS_CONFIG.spreadsheetId,
    });

    const sheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === SHEETS_CONFIG.sheetName,
    );

    return sheet?.properties?.sheetId || 0;
  }

  /**
   * Verifies that headers exist and are correct
   * @returns {Promise<void>}
   */
  async verifyHeaders() {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        range: `${SHEETS_CONFIG.sheetName}!A1:${getColumnLetter(SHEETS_CONFIG.headers.length - 1)}1`,
      });

      const existingHeaders = response.data.values?.[0] || [];

      // If headers don't match, update them
      if (
        JSON.stringify(existingHeaders) !==
        JSON.stringify(SHEETS_CONFIG.headers)
      ) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: SHEETS_CONFIG.spreadsheetId,
          range: `${SHEETS_CONFIG.sheetName}!A1:${getColumnLetter(SHEETS_CONFIG.headers.length - 1)}1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [SHEETS_CONFIG.headers],
          },
        });
        logOut(this.constructor.name, "Updated sheet headers");
      }
    } catch (error) {
      logError(this.constructor.name, "Error verifying headers", error);
      throw error;
    }
  }

  /**
   * Writes feedback data to the sheet
   * @param {Object} feedbackData - The feedback data to write
   * @returns {Promise<{success: boolean, rowId?: number, error?: string}>}
   */
  async writeFeedback(feedbackData) {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      // Prepare row data matching the headers
      const rowData = [
        feedbackData.checkBox || "",
        feedbackData.timestamp || new Date().toISOString(),
        feedbackData.pageUrl || "",
        feedbackData.feedbackType || "general",
        feedbackData.message || "",
        feedbackData.userEmail || "",
        feedbackData.userAgent || "",
        feedbackData.raceId || "",
        feedbackData.year || "",
        feedbackData.stage || "",
        feedbackData.classification || "",
      ];

      logOut(this.constructor.name, `[Feedback] ${feedbackData.message}`);
      // Append the row
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: SHEETS_CONFIG.spreadsheetId,
        range: `${SHEETS_CONFIG.sheetName}!A:${getColumnLetter(SHEETS_CONFIG.headers.length - 1)}`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: [rowData],
        },
      });

      // Extract row number from the response
      const updatedRange = response.data.updates?.updatedRange || "";
      const rowMatch = updatedRange.match(/(\d+):(\d+)$/);
      const rowId = rowMatch ? parseInt(rowMatch[1]) : null;

      logOut(
        this.constructor.name,
        `Successfully wrote feedback to row ${rowId}`,
      );

      return {
        success: true,
        rowId: rowId,
      };
    } catch (error) {
      logError(this.constructor.name, "Error writing feedback to sheet", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test the connection and setup
   * @returns {Promise<{success: boolean, message?: string, error?: string}>}
   */
  async testConnection() {
    try {
      if (!this.sheets) {
        await this.initialize();
      }

      const testData = {
        pageUrl: "https://test.com",
        feedbackType: "test",
        message: "Test feedback from backend setup",
        userEmail: "test@example.com",
        timestamp: new Date().toISOString(),
      };
      logOut(this.constructor.name, "Writing test feedback...");
      const result = await this.writeFeedback(testData);

      return {
        success: result.success,
        message: result.success
          ? "Connection test successful"
          : "Connection test failed",
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const googleSheetsService = new ServiceGoogleSheets();

// Initialize with error handling
googleSheetsService.initialize().catch((error) => {
  logError("ServiceGoogleSheets", "Failed to initialize on startup", error);
  // Service methods will retry initialization when called
});

export { googleSheetsService };
