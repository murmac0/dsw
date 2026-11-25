import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@dsw/tokens/fonts";
import "./global.css";
import { ThemeProvider } from "@dsw/ui";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

if (new URLSearchParams(location.search).has("token-probe")) {
  // Test fixture for e2e/token-export.spec.ts: lazy-loaded (not in the app
  // bundle) and run against the app's own compiled stylesheet.
  void import("./token-probe");
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  );
}
