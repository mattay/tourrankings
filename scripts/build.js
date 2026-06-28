// scripts/build.js
import { build } from "bun";
import { watch } from "fs";

/**
 * Build configuration for different app bundles
 * @typedef {Object} BuildTarget
 * @property {string} name - Target name for logging
 * @property {string[]} entrypoints - Entry point files
 * @property {string} outdir - Output directory
 * @property {boolean} [splitting] - Enable code splitting
 * @property {string} [format] - Output format (esm, cjs, iife)
 */

/**
 * Directories that contain client source code.
 * Changes to these trigger a rebuild in watch mode.
 * @type {string[]}
 */
const WATCH_PATHS = ["./src/client", "./src/core/cycling", "./src/utils"];

/**
 * Debounce window for filesystem events in milliseconds.
 * @type {number}
 */
const WATCH_DEBOUNCE_MS = 200;

/**
 * Builds multiple JavaScript bundles with shared configuration
 * @param {boolean} isProduction - Whether this is a production build
 * @returns {Promise<void>}
 */
async function buildJavaScript(isProduction) {
  /** @type {BuildTarget[]} */
  const targets = [
    {
      name: "Main App",
      entrypoints: ["./src/client/index.js"], // TODO make this cycling
      outdir: "./public/js/",
      splitting: true,
      format: "esm",
    },
    {
      name: "Feedback App",
      entrypoints: ["./src/client/feedback.js"],
      outdir: "./public/js/",
      splitting: false, // Keep feedback as single bundle for caching
      format: "iife", // Self-contained for easy loading
    },
  ];

  const buildPromises = targets.map(async (target) => {
    try {
      console.log(`Building ${target.name}...`);

      const result = await build({
        entrypoints: target.entrypoints,
        outdir: target.outdir,
        minify: isProduction,
        sourcemap: isProduction ? "none" : "linked",
        target: "browser",
        splitting: target.splitting,
        format: target.format || "esm",
      });

      if (result.outputs.length > 0) {
        console.log(`✓ ${target.name} build succeeded:`);
        for (const output of result.outputs) {
          console.log(`  - ${output.path}`);
        }
      } else {
        console.warn(
          `⚠ ${target.name} build completed but no output files generated`,
        );
      }

      return result;
    } catch (error) {
      console.error(`✗ ${target.name} build failed:`, error);
      throw error;
    }
  });

  await Promise.all(buildPromises);
}

/**
 * Builds CSS files with optimization
 * @param {boolean} isProduction - Whether this is a production build
 * @returns {Promise<void>}
 */
async function buildCSS(isProduction) {
  /** @type {BuildTarget[]} */
  const cssTargets = [
    {
      name: "Base Styles",
      entrypoints: ["./src/client/styles/base.css"],
      outdir: "./public/css",
    },
    {
      name: "Cycling Styles",
      entrypoints: ["./src/client/styles/cycling.css"],
      outdir: "./public/css",
    },
    {
      name: "Feedback Styles",
      entrypoints: ["./src/client/styles/feedback.css"],
      outdir: "./public/css",
    },
  ];

  const buildPromises = cssTargets.map(async (target) => {
    try {
      console.log(`Building ${target.name}...`);

      const result = await build({
        entrypoints: target.entrypoints,
        outdir: target.outdir,
        minify: isProduction,
        sourcemap: isProduction ? "none" : "linked",
        target: "browser",
      });

      if (result.outputs.length > 0) {
        console.log(`✓ ${target.name} CSS build succeeded:`);
        for (const output of result.outputs) {
          console.log(`  - ${output.path}`);
        }
      }

      return result;
    } catch (error) {
      console.error(`✗ ${target.name} CSS build failed:`, error);
      throw error;
    }
  });

  await Promise.all(buildPromises);
}

/**
 * Creates a debounced function that waits for the specified delay
 * before invoking the wrapped function.
 * @template {(...args: any[]) => void} T
 * @param {T} fn - Function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void}
 */
function debounce(fn, delay) {
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Determines if the build was invoked with the --watch flag.
 * @returns {boolean}
 */
function isWatchMode() {
  return process.argv.includes("--watch");
}

/**
 * Starts watching client source directories and rebuilds when files change.
 * @returns {Promise<void>}
 */
async function watchBuild() {
  console.log(
    `Watching for changes: ${WATCH_PATHS.join(", ")} (press Ctrl+C to stop)`,
  );

  const rebuild = debounce(async () => {
    console.log("\nChange detected, rebuilding client assets...");
    try {
      await buildAll({ exitOnError: false });
      console.log("✓ Rebuild completed");
    } catch {
      console.error("✗ Rebuild failed, waiting for next change...");
    }
  }, WATCH_DEBOUNCE_MS);

  /** @type {import("fs").FSWatcher[]} */
  const watchers = WATCH_PATHS.map((watchPath) => {
    return watch(watchPath, { recursive: true }, (_eventType, filename) => {
      // Ignore hidden files and common noise (e.g. .DS_Store, editor swap files).
      if (!filename || filename.startsWith(".") || filename.includes("/.")) {
        return;
      }
      rebuild();
    });
  });

  // Keep the process alive until interrupted.
  await new Promise((resolve) => {
    process.once("SIGINT", () => {
      console.log("\nStopping watcher...");
      watchers.forEach((watcher) => watcher.close());
      resolve(undefined);
    });
  });
}

/**
 * Main build function
 * @param {Object} [options]
 * @param {boolean} [options.exitOnError=true] - Exit the process on build error.
 * @returns {Promise<void>}
 */
async function buildAll({ exitOnError = true } = {}) {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    console.log(
      `Building in ${isProduction ? "production" : "development"} mode...`,
    );

    // Build JavaScript and CSS in parallel
    await Promise.all([buildJavaScript(isProduction), buildCSS(isProduction)]);

    console.log("✓ All builds completed successfully!");
  } catch (error) {
    console.error("✗ Build process failed:", error);
    if (exitOnError) {
      process.exit(1);
    }
    throw error;
  }
}

/**
 * Entry point for the build script.
 * Runs a one-shot build unless --watch is provided.
 * @returns {Promise<void>}
 */
async function main() {
  await buildAll({ exitOnError: !isWatchMode() });
  if (isWatchMode()) {
    await watchBuild();
  }
}

main();
