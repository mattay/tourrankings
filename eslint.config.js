// eslint.config.js
import js from "@eslint/js";
import prettierRecommended from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  // Base JS rules
  js.configs.recommended,

  // Prettier config disables conflicting rules
  prettierRecommended,

  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Node.js globals (console, process, etc.)
        ...globals.browser, // Browser globals (window, document, etc.)
        d3: "readonly",
      },
    },
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prettier/prettier": "warn",
    },
  },
];
