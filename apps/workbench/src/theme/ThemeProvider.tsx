import * as stylex from "@stylexjs/stylex";
import { createContext, use, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { color, fontFamily } from "@dsw/tokens/semantic.stylex";
import { darkTheme } from "@dsw/tokens/themes/dark";
import type { ThemeName } from "@dsw/tokens";

const styles = stylex.create({
  // Applied to <html> so portaled overlays inherit canvas, text colour and
  // font as well as the theme's variables.
  document: {
    backgroundColor: color.bgCanvas,
    color: color.fgDefault,
    fontFamily: fontFamily.sans,
  },
});

interface ThemeContextValue {
  theme: ThemeName;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = use(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("light");

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  // The theme class goes on <html>, not on a wrapper element: overlays
  // (Dialog, Select's popover) are portaled to document.body by React Aria,
  // so a theme scoped to a wrapper div would never reach them.
  useLayoutEffect(() => {
    const className = stylex.props(
      styles.document,
      theme === "dark" && darkTheme,
    ).className;
    if (!className) return;
    const classes = className.split(" ");
    document.documentElement.classList.add(...classes);
    return () => document.documentElement.classList.remove(...classes);
  }, [theme]);

  return (
    <ThemeContext value={value}>
      {children}
    </ThemeContext>
  );
}
