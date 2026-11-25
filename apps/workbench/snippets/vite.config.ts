import react from "@vitejs/plugin-react";
import stylexVite from "@stylexjs/unplugin/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // @dsw/ui ships StyleX source; this compiles it with your own code.
    stylexVite({ unstable_moduleResolution: { type: "commonJS" } }),
    react(),
  ],
});
