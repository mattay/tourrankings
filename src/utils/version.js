import fsSync from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Returns the application version from APP_VERSION env var or falls back to package.json.
 * Logs a warning if APP_VERSION is empty or not set.
 * @returns {string} The application version.
 */
export function getAppVersion() {
  const appVersion = process.env.APP_VERSION;
  if (appVersion && appVersion.trim() !== "") {
    return appVersion;
  }

  const { logOut } = require("@utils/logging");
  logOut(
    "Config",
    "APP_VERSION is empty or not set. Using fallback version.",
    "warn",
  );

  try {
    const pkgPath = join(__dirname, "../../package.json");
    const pkg = JSON.parse(fsSync.readFileSync(pkgPath, "utf8"));
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}