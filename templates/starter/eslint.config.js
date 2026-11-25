import js from "@eslint/js";
import dsw from "@dsw/eslint-plugin";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: globals.browser } },
  // The design system's rules: tokens only, @dsw/ui components over native
  // elements, layout primitives. The same rules the dsw MCP server checks.
  { files: ["src/**/*.{ts,tsx}"], ...dsw.configs.recommended },
);
