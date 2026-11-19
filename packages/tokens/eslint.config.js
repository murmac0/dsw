import globals from "globals";
import { baseConfig, stylexConfig } from "@dsw/eslint-config";

export default [
  ...baseConfig,
  ...stylexConfig,
  { ignores: ["generated/**"] },
  // Build scripts run in Node, not the browser.
  { files: ["scripts/**"], languageOptions: { globals: globals.node } },
];
