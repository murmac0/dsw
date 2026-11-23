import stylex from "@stylexjs/eslint-plugin";
import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";
import dsw from "@dsw/eslint-plugin";

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

/**
 * StyleX checks plus the design system's token rules. Packages that build
 * @dsw/ui use this; apps built *with* it add `dsw.configs.recommended`
 * (see @dsw/eslint-plugin), which also prefers @dsw/ui components.
 */
export const stylexConfig = tseslint.config(dsw.configs.library, {
  plugins: {
    "@stylexjs": stylex,
  },
  rules: {
    "@stylexjs/no-unused": "error",
    "@stylexjs/valid-styles": "error",
    "@stylexjs/valid-shorthands": "error",
    "@stylexjs/no-conflicting-props": "error",
    "@stylexjs/enforce-extension": "error",
  },
});

export default baseConfig;
