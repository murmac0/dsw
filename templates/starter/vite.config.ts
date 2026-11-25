import react from "@vitejs/plugin-react";
import stylexVite from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    stylexVite({
      // @dsw/ui and @dsw/tokens ship StyleX source. The plugin finds them
      // (they depend on @stylexjs/stylex) and compiles them with your own
      // code, so their CSS ends up in your bundle.
      unstable_moduleResolution: { type: "commonJS" },
    }),
    react(),
  ],
});
