import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "@dsw/tokens/fonts";
import "./global.css";
import { ThemeProvider } from "@dsw/ui";
import { Frame, parseFrame } from "./frame";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

if (new URLSearchParams(location.search).has("token-probe")) {
  // Test fixture for e2e/token-export.spec.ts: lazy-loaded (not in the app
  // bundle) and run against the app's own compiled stylesheet.
  void import("./token-probe");
} else {
  // A preview frame takes its theme from the URL and doesn't save it.
  const frame = parseFrame(location.hash);
  createRoot(rootElement).render(
    <StrictMode>
      {frame ? (
        <ThemeProvider brand={frame.brand} theme={frame.theme} persist={false}>
          <Frame name={frame.name} />
        </ThemeProvider>
      ) : (
        <ThemeProvider>
          <App />
        </ThemeProvider>
      )}
    </StrictMode>,
  );
}
