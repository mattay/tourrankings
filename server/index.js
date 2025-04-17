// @ts-check
import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import config from "./config";
import setupMiddleware from "./middleware";
import routes from "./routes";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = config.paths.public;

// Create Express app
const app = express();

// Apply middleware
setupMiddleware(app);

// API routes
app.use("/api", routes);

// Static files
app.use(express.static(publicPath));

// Explicit route for the root URL
app.get("/", (req, res) => {
  res.sendFile(join(publicPath, "index.html"));
});

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${config.env} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection", err);
  // In production, you might want to exit the process
  // process.exit(1);
});

export default app;
