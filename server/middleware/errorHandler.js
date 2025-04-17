// @ts-check
import config from "../config.js";
import logger from "../utils/logger.js";

/**
 * Central error handling middleware
 */
export default function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(`Error processing request to ${req.method} ${req.url}`, err);

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: config.env === "production" ? "An error occurred" : err.message,
      status: statusCode,
    },
  });
}
