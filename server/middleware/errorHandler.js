import config from "../config";

/**
 * Central error handling middleware
 */
export default function errorHandler(err, req, res, next) {
  // Log the error
  console.error("Error:", err.message);

  if (config.env === "development") {
    console.error(err.stack);
  }

  // Set appropriate status code
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    error: {
      message: config.env === "production" ? "An error occured" : err.message,
      status: statusCode,
    },
  });
}
