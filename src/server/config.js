import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parseBool, parseNumber } from "@utils/sanity";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

/**
 * Log target rotation and retention configuration.
 * @typedef {Object} LogTargetConfig
 * @property {number} rotationDays - Days before rotation triggers
 * @property {number} rotationSizeMB - Megabytes before rotation triggers
 * @property {number|null} retentionDays - Days to keep rotated files (null = forever)
 */

/**
 * Application configuration object.
 *
 * @typedef {Object} Config
 * @property {string} env - Current environment ("development", "production", etc.).
 * @property {number} port - Port number the server listens on.
 * @property {Object} paths - File system paths used by the app.
 * @property {string} paths.root - Root directory of the project.
 * @property {string} paths.public - Public assets directory.
 * @property {Object} paths.data - Data-related paths.
 * @property {string} paths.data.public - Directory for public CSV data files.
 * @property {Object} security - Security-related settings.
 * @property {Object} security.cors - CORS configuration.
 * @property {string|string[]} security.cors.origin - Allowed CORS origin(s).
 * @property {string[]} security.cors.methods - Allowed HTTP methods for CORS.
 * @property {Object} security.rateLimit - Rate limiting settings.
 * @property {number} security.rateLimit.windowMs - Time window in milliseconds.
 * @property {number} security.rateLimit.max - Max requests per window.
 * @property {Object} security.headers - Security headers settings.
 * @property {Object} security.headers.contentSecurityPolicy - CSP settings.
 * @property {Object} security.headers.contentSecurityPolicy.directives - CSP directives.
 * @property {string[]} security.headers.contentSecurityPolicy.directives.defaultSrc - Allowed default sources.
 * @property {string[]} security.headers.contentSecurityPolicy.directives.scriptSrc - Allowed script sources.
 * @property {string[]} security.headers.contentSecurityPolicy.directives.styleSrc - Allowed style sources.
 * @property {string[]} security.headers.contentSecurityPolicy.directives.imgSrc - Allowed image sources.
 * @property {string[]} security.headers.contentSecurityPolicy.directives.connectSrc - Allowed connect sources.
 * @property {Object} dataService - Data service configuration.
 * @property {boolean} dataService.autoRefresh - Enable auto-refresh.
 * @property {number} dataService.refreshInterval - Interval in milliseconds for auto-refresh.
 * @property {Object} logging - File logging configuration.
 * @property {boolean} logging.enabled - Whether file logging is enabled.
 * @property {LogTargetConfig} logging.access - Access log (pages, unknowns) config.
 * @property {LogTargetConfig} logging.api - API log config.
 * @property {LogTargetConfig} logging.health - Health check log config.
 * @property {LogTargetConfig} logging.static - Static asset log config.
 */

/** @type {Config} */
const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 8080,

  // Path configuration
  paths: {
    root: join(__dirname, ""),
    public: join(__dirname, "../../public"),
    data: {
      public: join(__dirname, "../../public/data/csv"),
    },
  },

  // Security settings
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
        : ["*"],
      methods: ["GET", "POST"],
    },
    rateLimit: {
      windowMs: 17 * 60 * 1000, // 17 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
    },
    headers: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "cdn.jsdelivr.net", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
          formAction: ["'self'"],
        },
      },
    },
  },

  dataService: {
    autoRefresh: parseBool(process.env.DATA_AUTO_REFRESH, false),
    refreshInterval: parseNumber(
      process.env.DATA_AUTO_REFRESH_INTERVAL,
      3600000,
    ),
    watchFiles: parseBool(process.env.DATA_WATCH_FILES, false),
    watchDebounceMs: parseNumber(process.env.DATA_WATCH_DEBOUNCE_MS, 60000),
    dataDir: process.env.DATA_DIR || "./data/csv/",
  },

  healthCheck: {
    memoryWarningThresholdMB: parseNumber(
      process.env.HEALTH_MEMORY_WARNING_THRESHOLD_MB,
      400,
    ),
  },

  // File logging configuration
  logging: {
    enabled: parseBool(process.env.FILE_LOGGING_ENABLED, true),
    access: {
      rotationDays: parseNumber(process.env.LOG_ACCESS_ROTATION_DAYS, 90),
      rotationSizeMB: parseNumber(process.env.LOG_ACCESS_ROTATION_SIZE_MB, 50),
      retentionDays: parseNumber(process.env.LOG_ACCESS_RETENTION_DAYS, null),
    },
    api: {
      rotationDays: parseNumber(process.env.LOG_API_ROTATION_DAYS, 90),
      rotationSizeMB: parseNumber(process.env.LOG_API_ROTATION_SIZE_MB, 50),
      retentionDays: parseNumber(process.env.LOG_API_RETENTION_DAYS, null),
    },
    health: {
      rotationDays: parseNumber(process.env.LOG_HEALTH_ROTATION_DAYS, 7),
      rotationSizeMB: parseNumber(process.env.LOG_HEALTH_ROTATION_SIZE_MB, 10),
      retentionDays: parseNumber(process.env.LOG_HEALTH_RETENTION_DAYS, null),
    },
    static: {
      rotationDays: parseNumber(process.env.LOG_STATIC_ROTATION_DAYS, 30),
      rotationSizeMB: parseNumber(process.env.LOG_STATIC_ROTATION_SIZE_MB, 50),
      retentionDays: parseNumber(process.env.LOG_STATIC_RETENTION_DAYS, null),
    },
  },
};

if (config.env === "development") {
  config.security.headers.contentSecurityPolicy.directives.upgradeInsecureRequests =
    null;
}

export default config;
