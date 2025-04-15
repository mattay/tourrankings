import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import config from "./config";
import setupMiddleware from "./middleware";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();

// Apply middleware
setupMiddleware(app);

app.use(express.static(join(__dirname, "../public")));
