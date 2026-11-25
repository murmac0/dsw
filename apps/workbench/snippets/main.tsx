import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@dsw/ui";
import "@dsw/tokens/fonts";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>,
);
