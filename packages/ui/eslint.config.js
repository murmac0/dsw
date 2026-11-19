import globals from "globals";
import { baseConfig, reactConfig, stylexConfig } from "@dsw/eslint-config";

export default [
  ...baseConfig,
  ...reactConfig,
  ...stylexConfig,
  { ignores: ["generated/**"] },
  // Build scripts run in Node, not the browser.
  { files: ["scripts/**"], languageOptions: { globals: globals.node } },
];
