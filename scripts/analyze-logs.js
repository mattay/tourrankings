// scripts/analyze-logs.js
import { readFileSync, mkdirSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * @typedef {Object} LogEntry
 * @property {string} timestamp
 * @property {string} requestId
 * @property {string} method
 * @property {string} url
 * @property {string} resourceType
 * @property {number} status
 * @property {number} responseTimeMs
 * @property {number} responseSizeBytes
 * @property {string} userAgent
 * @property {string} hashedIp
 * @property {string} [referrer]
 */

// --- Bot classification ---

const AI_CRAWLERS = [
  "GPTBot",
  "ClaudeBot",
  "OAI-SearchBot",
  "PerplexityBot",
  "xAI-SearchBot",
  "ChatGPT-User",
  "DeepSeekBot",
  "Google-CloudVertexBot",
];

const SEARCH_ENGINES = [
  "Googlebot",
  "bingbot",
  "YandexBot",
  "Baiduspider",
];

const DATA_PROCESSORS = [
  "CCBot",
  "CheckMarkNetwork",
  "Pandalytics",
  "Dataprovider",
];

const MONITORING = [
  "okhttp",
  "HeadlessChrome",
  "Go-http-client",
  "req/v3",
];

/**
 * Classify a user agent into a category.
 * @param {string} ua - User agent string
 * @returns {'ai-crawler' | 'search-engine' | 'data-processor' | 'monitoring' | 'human'}
 */
function classifyUserAgent(ua) {
  if (AI_CRAWLERS.some((k) => ua.includes(k))) return "ai-crawler";
  if (SEARCH_ENGINES.some((k) => ua.includes(k))) return "search-engine";
  if (DATA_PROCESSORS.some((k) => ua.includes(k))) return "data-processor";
  if (MONITORING.some((k) => ua.includes(k))) return "monitoring";
  return "human";
}

// --- Scanner detection ---

/**
 * Detect if a URL matches a scanner/probe pattern.
 * @param {string} url
 * @returns {string | null} Scanner type or null
 */
function detectScannerType(url) {
  if (
    url.includes("wp-login") ||
    url.includes("wp-includes") ||
    url.includes("xmlrpc") ||
    url.includes("wlwmanifest") ||
    url.includes("wp-json")
  ) {
    return "wordpress-scan";
  }

  if (
    url.includes(".env") ||
    url.includes(".git") ||
    url.includes("config.json") ||
    url.includes("secrets.json") ||
    url.includes("credentials") ||
    url.includes("Dockerfile") ||
    url.includes("docker-compose") ||
    url.includes("appsettings") ||
    url.includes("web.config") ||
    url.includes("firebase") ||
    url.includes("service-account") ||
    url.includes("gcp-credentials") ||
    url.includes("key.json") ||
    url.includes("keyfile.json") ||
    url.includes("account.json")
  ) {
    return "config-scan";
  }

  if (url.endsWith(".sql") || url.includes(".sql?")) return "sql-scan";

  if (url.includes(".well-known/acme-challenge")) return "ssl-probe";

  if (
    url.includes("settings.py") ||
    url.includes("local_settings") ||
    url.includes("config/database") ||
    url.includes("config/secrets") ||
    url.includes("config/application") ||
    url.includes("config/production") ||
    url.includes("config/development") ||
    url.includes("application.yml") ||
    url.includes("application.yaml") ||
    url.includes("application.properties") ||
    url.includes("amplify.yml") ||
    url.includes("composer.json") ||
    url.includes("local.settings.json")
  ) {
    return "platform-scan";
  }

  if (
    url.includes(".npmrc") ||
    url.includes(".yarnrc") ||
    url.includes(".pypirc") ||
    url.includes(".vscode") ||
    url.includes(".idea") ||
    url.includes(".github") ||
    url.includes(".gitlab") ||
    url.includes(".firebase")
  ) {
    return "tooling-scan";
  }

  if (
    url.includes("logs/") ||
    url.includes("storage/logs") ||
    url.includes("var/log")
  ) {
    return "log-scan";
  }

  if (
    url.includes("cmd_sco") ||
    url.includes("asdkjh2k3h4") ||
    url.includes("test.php") ||
    url.includes("phpinfo.php") ||
    url.includes("wp-config")
  ) {
    return "unknown-scan";
  }

  return null;
}

// --- URL categorization ---

/**
 * Categorize a URL for aggregation.
 * @param {string} url
 * @returns {string}
 */
function categorizeUrl(url) {
  if (url.startsWith("/race/")) {
    const parts = url.split("/");
    return parts[2] || "race";
  }
  if (url === "/" || url === "/privacy") return "pages";
  if (url === "/robots.txt") return "robots.txt";

  const scanner = detectScannerType(url);
  if (scanner) return scanner;

  return "other";
}

// --- Analysis functions ---

/**
 * Parse raw log lines into structured objects.
 * @param {string} logContent
 * @returns {LogEntry[]}
 */
function parseLog(logContent) {
  return logContent
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        console.warn(`Skipping malformed line: ${line.slice(0, 80)}`);
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * Generate hourly time series data.
 * @param {LogEntry[]} logs
 * @returns {Array<Object>}
 */
function buildHourlySeries(logs) {
  const hourly = {};

  for (const l of logs) {
    const hour = l.timestamp.slice(0, 13); // YYYY-MM-DDTHH
    if (!hourly[hour]) {
      hourly[hour] = {
        hour,
        total: 0,
        200: 0,
        404: 0,
        429: 0,
        bot: 0,
        human: 0,
        responseTimes: [],
      };
    }
    const bucket = hourly[hour];
    bucket.total++;
    bucket[String(l.status)] = (bucket[String(l.status)] || 0) + 1;

    const category = classifyUserAgent(l.userAgent);
    if (category === "human") {
      bucket.human++;
    } else {
      bucket.bot++;
    }
    bucket.responseTimes.push(l.responseTimeMs);
  }

  return Object.values(hourly)
    .map((h) => ({
      hour: h.hour,
      total: h.total,
      200: h["200"] || 0,
      404: h["404"] || 0,
      429: h["429"] || 0,
      bot: h.bot,
      human: h.human,
      avgResponseMs: Math.round(h.responseTimes.reduce((a, b) => a + b, 0) / h.responseTimes.length),
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));
}

/**
 * Build URL category breakdown.
 * @param {LogEntry[]} logs
 * @returns {Array<Object>}
 */
function buildUrlCategories(logs) {
  const cats = {};

  for (const l of logs) {
    const cat = categorizeUrl(l.url);
    if (!cats[cat]) {
      cats[cat] = { category: cat, count: 0, 200: 0, 404: 0, 429: 0 };
    }
    cats[cat].count++;
    cats[cat][String(l.status)] = (cats[cat][String(l.status)] || 0) + 1;
  }

  return Object.values(cats).sort((a, b) => b.count - a.count);
}

/**
 * Build race page view counts.
 * @param {LogEntry[]} logs
 * @returns {Array<Object>}
 */
function buildRacePages(logs) {
  const races = {};

  for (const l of logs) {
    if (!l.url.startsWith("/race/")) continue;
    const parts = l.url.split("/");
    const race = parts[2];
    if (!race) continue;
    if (!races[race]) races[race] = { race, views: 0 };
    if (l.status === 200) races[race].views++;
  }

  return Object.values(races).sort((a, b) => b.views - a.views);
}

/**
 * Build bot activity report.
 * @param {LogEntry[]} logs
 * @returns {Array<Object>}
 */
function buildBotReport(logs) {
  const bots = {};

  for (const l of logs) {
    const category = classifyUserAgent(l.userAgent);
    if (category === "human") continue;

    const key = l.userAgent;
    if (!bots[key]) {
      bots[key] = {
        userAgent: key,
        category,
        requests: 0,
        firstSeen: l.timestamp,
        lastSeen: l.timestamp,
      };
    }
    bots[key].requests++;
    if (l.timestamp < bots[key].firstSeen) bots[key].firstSeen = l.timestamp;
    if (l.timestamp > bots[key].lastSeen) bots[key].lastSeen = l.timestamp;
  }

  return Object.values(bots).sort((a, b) => b.requests - a.requests);
}

/**
 * Compute response time statistics.
 * @param {number[]} values
 * @returns {{ p50: number, p90: number, p95: number, p99: number, min: number, max: number, avg: number }}
 */
function percentiles(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const len = sorted.length;
  const pick = (p) => sorted[Math.min(Math.floor(len * p), len - 1)];

  return {
    p50: pick(0.5),
    p90: pick(0.9),
    p95: pick(0.95),
    p99: pick(0.99),
    min: sorted[0],
    max: sorted[len - 1],
    avg: Math.round(values.reduce((a, b) => a + b, 0) / len),
  };
}

/**
 * Build response time report.
 * @param {LogEntry[]} logs
 * @returns {Object}
 */
function buildResponseTimes(logs) {
  const allTimes = logs.map((l) => l.responseTimeMs);
  const overall = percentiles(allTimes);

  const byCategory = {};
  for (const l of logs) {
    let cat = "other";
    if (l.url.startsWith("/race/")) cat = "race";
    else if (l.url === "/") cat = "homepage";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(l.responseTimeMs);
  }

  return {
    overall,
    byCategory: Object.entries(byCategory)
      .map(([category, times]) => ({
        category,
        count: times.length,
        ...percentiles(times),
      }))
      .sort((a, b) => b.count - a.count),
  };
}

/**
 * Build security/scanner event report.
 * @param {LogEntry[]} logs
 * @returns {Array<Object>}
 */
function buildSecurityReport(logs) {
  const events = {};

  for (const l of logs) {
    const type = detectScannerType(l.url);
    if (!type) continue;

    if (!events[type]) {
      events[type] = {
        type,
        urls: new Set(),
        totalHits: 0,
        firstSeen: l.timestamp,
        lastSeen: l.timestamp,
      };
    }
    events[type].urls.add(l.url);
    events[type].totalHits++;
    if (l.timestamp < events[type].firstSeen) events[type].firstSeen = l.timestamp;
    if (l.timestamp > events[type].lastSeen) events[type].lastSeen = l.timestamp;
  }

  return Object.values(events)
    .map((e) => ({ ...e, urls: [...e.urls] }))
    .sort((a, b) => b.totalHits - a.totalHits);
}

/**
 * Build summary stats.
 * @param {LogEntry[]} logs
 * @returns {Object}
 */
function buildSummary(logs) {
  const statuses = {};
  let botCount = 0;

  for (const l of logs) {
    statuses[l.status] = (statuses[l.status] || 0) + 1;
    if (classifyUserAgent(l.userAgent) !== "human") botCount++;
  }

  const times = logs.map((l) => l.responseTimeMs);

  return {
    totalRequests: logs.length,
    dateRange: {
      start: logs[0]?.timestamp,
      end: logs[logs.length - 1]?.timestamp,
    },
    statusBreakdown: statuses,
    botRequests: botCount,
    humanRequests: logs.length - botCount,
    botPercentage: Math.round((botCount / logs.length) * 100),
    avgResponseMs: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
    responseTimePercentiles: percentiles(times),
  };
}

// --- Output ---

/**
 * Write a JSON file to the output directory.
 * @param {string} outDir
 * @param {string} filename
 * @param {Object} data
 */
function writeJson(outDir, filename, data) {
  const path = resolve(outDir, filename);
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
  console.log(`  ✓ ${filename}`);
}

// --- Main ---

async function main() {
  const logPath = process.argv[2];
  if (!logPath) {
    console.error("Usage: bun run scripts/analyze-logs.js <path-to-access.log>");
    process.exit(1);
  }

  const resolved = resolve(logPath);
  console.log(`Reading log file: ${resolved}`);

  const content = readFileSync(resolved, "utf-8");
  const logs = parseLog(content);
  console.log(`Parsed ${logs.length} log entries`);

  const outDir = resolve(__dirname, "logs-analysis");
  mkdirSync(outDir, { recursive: true });

  console.log("Writing output files:");
  writeJson(outDir, "summary.json", buildSummary(logs));
  writeJson(outDir, "hourly.json", buildHourlySeries(logs));
  writeJson(outDir, "url-categories.json", buildUrlCategories(logs));
  writeJson(outDir, "race-pages.json", buildRacePages(logs));
  writeJson(outDir, "bots.json", buildBotReport(logs));
  writeJson(outDir, "response-times.json", buildResponseTimes(logs));
  writeJson(outDir, "security.json", buildSecurityReport(logs));

  console.log(`\nDone! Output written to: ${outDir}`);
}

main();
