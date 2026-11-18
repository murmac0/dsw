import react from "@vitejs/plugin-react";
import stylexVite from "@stylexjs/unplugin/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    stylexVite({
      unstable_moduleResolution: { type: "commonJS" },
    }),
    react(),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
});
