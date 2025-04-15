import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "../config";

/**
 * Configure and apply security middleware to Express App
 * @parm {object} app - Express application
 */
export default function setupSecurityMiddleware(app) {
  // Use Helmet for setting HTTP sercurity headers
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

  // Apply rate limiting to all requests
  if (config.env === "production") {
    app.use(
      rateLimit({
        windowMs: config.security.rateLimit.windowMs,
        max: config.security.rateLimit.max,
        message: config.security.rateLimit.message,
      }),
    );
  }

  // Prevent clickjacking
  app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "DENY");
    next();
  });

  // app.disable("x-powered-by");
}
