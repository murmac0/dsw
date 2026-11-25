import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@dsw/ui";
import "@dsw/tokens/fonts";
import "./global.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root");

createRoot(root).render(
  <StrictMode>
    {/* Puts the brand × mode theme on <html>. useTheme() changes it. */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
