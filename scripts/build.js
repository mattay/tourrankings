// scripts/build.js
import { build } from "bun";

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
 * Main build function
 * @returns {Promise<void>}
 */
async function buildAll() {
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
    process.exit(1);
  }
}

// Execute the build process
buildAll();
