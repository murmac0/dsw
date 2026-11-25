/// <reference types="vitest/config" />
import path from "node:path";
import react from "@vitejs/plugin-react";
import stylexVite from "@stylexjs/unplugin/vite";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import { examples } from "./vite-plugin-examples";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    conditions: ["import", "module", "browser", "development|production", "default"],
  },
  plugins: [
    examples(),
    stylexVite({
      unstable_moduleResolution: { type: "commonJS" },
    }),
    react(),
  ],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // Runs tests for the stories defined in Storybook's config.
          // See: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});