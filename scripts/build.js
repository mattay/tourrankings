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

    // CSS builds (add more entries as needed)
    const cssEntryPoints = [
      "./src/client/styles/base.css",
      "./src/client/styles/cycling.css",
    ];
    const cssResults = await Promise.all(
      cssEntryPoints.map((entry) =>
        build({
          entrypoints: [entry],
          outdir: "./public/css",
          minify: isProduction,
          sourcemap: isProduction ? "none" : "linked",
          target: "browser",
        }),
      ),
    );

    // Log all output files generated
    if (result.outputs.length > 0) {
      console.log("Build succeeded. Output files:");
      for (const output of result.outputs) {
        console.log(` - ${output.path}`);
      }
    } else {
      console.warn("Build completed but no output files were generated.");
    }

    // Log CSS output
    cssResults.forEach((result, i) => {
      if (result.outputs.length > 0) {
        console.log(
          `CSS build succeeded for ${cssEntryPoints[i]}. Output files:`,
        );
        for (const output of result.outputs) {
          console.log(` - ${output.path}`);
        }
      } else {
        console.warn(
          `CSS build for ${cssEntryPoints[i]} completed but no output files were generated.`,
        );
      }
    });
  } catch (error) {
    console.error("Build failed:", error);
    throw error;
  }
}

// Execute the build process
buildClient();
