// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { baseConfig, reactConfig, stylexConfig } from "@dsw/eslint-config";
import dsw from "@dsw/eslint-plugin";

export default [
  ...baseConfig,
  ...reactConfig,
  ...stylexConfig,
  ...storybook.configs["flat/recommended"],
  // The example page is held to the same rules as any product team's app.
  // The workbench's own demo pages predate the layout and type components
  // (and Foundations shows the raw palette on purpose), so they don't use
  // the app preset yet: `dsw-migrate src --dry-run` lists what's left.
  { files: ["src/pages/SettingsPage.tsx"], ...dsw.configs.recommended },
];
