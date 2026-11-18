// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { baseConfig, reactConfig, stylexConfig } from "@dsw/eslint-config";

export default [
  ...baseConfig,
  ...reactConfig,
  ...stylexConfig,
  ...storybook.configs["flat/recommended"]
];
