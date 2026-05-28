export { routesAPI } from "./routes-api";
export { routesSeasonRaces } from "./routes-season-races";
export { routesRace } from "./routes-race";
export { routesHealth } from "src/server/routes/routes-health";
// export { routesViews } from "./routesViews";

// If you need a default export as well:
import express from "express";
const router = express.Router();

// Additional router setup if needed
export default router;
