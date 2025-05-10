// eslint.config.js
import js from "@eslint/js";
import prettierRecommended from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import pluginJest from "eslint-plugin-jest";
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

  // Jest-specific rules for test files
  {
    files: ["src/tests/**/*.js", "**/*.test.js"],
    plugins: {
      jest: pluginJest,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...pluginJest.environments.globals.globals,
      },
    },
    extends: ["plugin:jest/recommended"],
    rules: {
      "jest/prefer-expect-assertions": "off",
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/valid-expect": "error",
    },
  },
];
