import * as stylex from "@stylexjs/stylex";
import { createContext, use, useLayoutEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { color, fontFamily } from "@dsw/tokens/semantic.stylex";
import { brands, themes } from "@dsw/tokens/themes";
import type { BrandName, ColorMode } from "@dsw/tokens";

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
  brand: BrandName;
  setBrand: (brand: BrandName) => void;
  theme: ColorMode;
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

const STORAGE_KEY = "dsw:appearance";

function readStored(): { brand?: BrandName; theme?: ColorMode } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      ...(brands.some((b) => b.id === parsed.brand) && {
        brand: parsed.brand as BrandName,
      }),
      ...((parsed.theme === "light" || parsed.theme === "dark") && {
        theme: parsed.theme,
      }),
    };
  } catch {
    return {};
  }
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Controlled brand (e.g. from a Storybook toolbar). */
  brand?: BrandName;
  /** Controlled colour mode. */
  theme?: ColorMode;
}

export function ThemeProvider({
  children,
  brand: brandProp,
  theme: themeProp,
}: ThemeProviderProps) {
  const isControlled = brandProp !== undefined || themeProp !== undefined;
  const [stored] = useState(() => (isControlled ? {} : readStored()));
  const [brandState, setBrandState] = useState<BrandName>(stored.brand ?? "iris");
  const [themeState, setThemeState] = useState<ColorMode>(stored.theme ?? "light");
  const brand = brandProp ?? brandState;
  const theme = themeProp ?? themeState;

  const value = useMemo<ThemeContextValue>(
    () => ({
      brand,
      theme,
      setBrand: setBrandState,
      toggleTheme: () =>
        setThemeState((current) => (current === "light" ? "dark" : "light")),
    }),
    [brand, theme],
  );

  // Remember the viewer's choice (a per-device convenience, so storage
  // failures in private windows are fine to ignore).
  useLayoutEffect(() => {
    if (isControlled) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand, theme }));
    } catch {
      /* storage unavailable */
    }
  }, [brand, theme, isControlled]);

  // Exactly one brand × mode theme goes on <html>, not on a wrapper:
  // overlays (Dialog, Select's popover) are portaled to document.body by
  // React Aria, and component-token aliases resolve at :root.
  useLayoutEffect(() => {
    const className = stylex.props(styles.document, themes[brand][theme]).className;
    if (!className) return;
    const classes = className.split(" ");
    const root = document.documentElement;
    root.classList.add(...classes);
    root.dataset.brand = brand;
    root.dataset.theme = theme;
    return () => root.classList.remove(...classes);
  }, [brand, theme]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
