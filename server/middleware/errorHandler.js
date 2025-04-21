import config from "../config.js";
import logger from "../utils/logger.js";

/**
 * Central error handling middleware for Express.
 *
 * Logs the error and sends a formatted JSON response.
 * In production, hides error details from the client.
 *
 * @param {Error & { statusCode?: number }} err - The error object, optionally with a statusCode property.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 * @returns {void}
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
