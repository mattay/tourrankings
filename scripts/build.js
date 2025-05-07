// scripts/build.js
import { build } from "bun";

/**
 * Builds the client-side bundle using Bun's build API.
 * - Minifies output in production.
 * - Generates source maps in development.
 */
async function buildClient() {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    const result = await build({
      entrypoints: ["./src/client/index.js"],
      outdir: "./public/js/dist",
      minify: isProduction,
      sourcemap: isProduction ? "none" : "linked",
      target: "browser",
    });

    // Log all output files generated
    if (result.outputs.length > 0) {
      console.log("Build succeeded. Output files:");
      for (const output of result.outputs) {
        console.log(` - ${output.path}`);
      }
    } else {
      console.warn("Build completed but no output files were generated.");
    }
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
}

// Execute the build process
buildClient();
