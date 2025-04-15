import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "process";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

const config = {
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3000,

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
      methods: ["GET"],
    },
    rateLimit: {
      windowMs: 17 * 60 * 100, // 17 minutes
      max: 100, // Limit each !P to 100 requests per windowMs
    },
    headers: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "cdn.jsdelivr.net", "'unsafe-inline'"],
          styleSrc: ["'self'", , "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
          connectSrc: ["'self'"],
        },
      },
    },
  },
};

export default config;
