import stylex from "@stylexjs/eslint-plugin";
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import noRawStyleValues from "./no-raw-style-values.js";

/**
 * Shared flat ESLint config for the workbench monorepo.
 * Consuming packages spread this and layer on project-specific overrides.
 */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },
  {
    ignores: ["dist/**", "storybook-static/**", "**/*.tsbuildinfo"],
  },
);

export const reactConfig = tseslint.config(
  {
    // eslint-plugin-react-hooks@7.1.1's "recommended-latest" config ships
    // its `plugins` field in the legacy eslintrc array shape, which flat
    // config rejects — only its `rules` object is actually usable as-is.
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs["recommended-latest"].rules,
  },
  jsxA11y.flatConfigs.recommended,
);

export const stylexConfig = tseslint.config({
  plugins: {
    "@stylexjs": stylex,
    dsw: { rules: { "no-raw-style-values": noRawStyleValues } },
  },
  rules: {
    "dsw/no-raw-style-values": "error",
    "@stylexjs/no-unused": "error",
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/enforce-extension": "error",
  },
});

export default baseConfig;
