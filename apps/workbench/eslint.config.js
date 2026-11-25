// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { baseConfig, reactConfig, stylexConfig } from "@dsw/eslint-config";
import dsw from "@dsw/eslint-plugin";

export default [
  // Copies of code shown on the Get started page, not part of the build.
  { ignores: ["snippets/**"] },
  ...baseConfig,
  ...reactConfig,
  ...stylexConfig,
  ...storybook.configs["flat/recommended"],
  // Docs pages built only from @dsw/ui are held to the same rules as any
  // product team's app. The component demos and Foundations predate the
  // layout and type components (and Foundations shows the raw palette on
  // purpose), so they don't use the app preset yet:
  // `dsw-migrate src --dry-run` lists what's left.
  {
    files: [
      "src/pages/SettingsPage.tsx",
      "src/pages/AiReadyPage.tsx",
      "src/pages/OverviewPage.tsx",
      "src/pages/GetStartedPage.tsx",
      "src/pages/AccessibilityPage.tsx",
      "src/pages/ComponentsIndexPage.tsx",
      "src/pages/LintPage.tsx",
      "src/pages/ComponentsPage.tsx",
      "src/examples/**/*.tsx",
    ],
    ...dsw.configs.recommended,
  },
];
