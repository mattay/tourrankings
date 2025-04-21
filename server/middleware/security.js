import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "../config";

/**
 * Configures and applies security-related middleware to the provided Express app.
 *
 * - Sets HTTP security headers using Helmet.
 * - Configures CORS (Cross-Origin Resource Sharing).
 * - Applies rate limiting in production.
 * - Prevents clickjacking by setting X-Frame-Options.
 *
 * @param {import('express').Application} app - The Express application instance to secure.
 * @returns {void}
 */
export default function setupSecurityMiddleware(app) {
  // Use Helmet for setting HTTP security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: config.security.headers.contentSecurityPolicy.directives,
      },
    }),
  );

  // Configure CORS
  app.use(
    cors({
      origin: config.security.cors.origin,
      methods: config.security.cors.methods,
      credentials: true,
    }),
  );

  // Apply rate limiting to all requests in production
  if (config.env === "production") {
    app.use(
      rateLimit({
        windowMs: config.security.rateLimit.windowMs,
        max: config.security.rateLimit.max,
        message: config.security.rateLimit.message,
      }),
    );
  }

  /**
   * Middleware to prevent clickjacking by setting X-Frame-Options header.
   *
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   */
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });
}
