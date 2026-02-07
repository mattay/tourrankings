import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

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

/** @type {Config} */
const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 8080,

  // Path configuration
  paths: {
    root: join(__dirname, ""),
    public: join(__dirname, "../public"),
    data: {
      public: join(__dirname, "../public/data/csv"),
    },
  },

  // Security settings
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
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
    autoRefresh:
      process.env.DATA_AUTO_REFRESH?.toLowerCase() === "true" || false,
    refreshInterval:
      parseInt(process.env.DATA_AUTO_REFRESH_INTERVAL, 10) || 3600000,
  },
};

if (config.env === "development") {
  config.security.headers.contentSecurityPolicy.directives.upgradeInsecureRequests =
    null;
}

export default config;
