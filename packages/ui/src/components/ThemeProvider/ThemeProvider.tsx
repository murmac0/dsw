import * as stylex from "@stylexjs/stylex";
import {
  createContext,
  use,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
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

export interface ThemeContextValue {
  brand: BrandName;
  setBrand: (brand: BrandName) => void;
  theme: ColorMode;
  setTheme: (theme: ColorMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** The current brand and colour mode, and setters for both. Use inside a ThemeProvider. */
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

export interface ThemeProviderProps {
  children: ReactNode;
  /** Controlled brand. Pair with `onBrandChange`. */
  brand?: BrandName;
  /** Starting brand when uncontrolled. A choice saved on this device wins. */
  defaultBrand?: BrandName;
  onBrandChange?: (brand: BrandName) => void;
  /** Controlled colour mode. Pair with `onThemeChange`. */
  theme?: ColorMode;
  /** Starting colour mode when uncontrolled. A choice saved on this device wins. */
  defaultTheme?: ColorMode;
  onThemeChange?: (theme: ColorMode) => void;
  /**
   * Remember the brand and mode on this device (localStorage) when
   * uncontrolled. Defaults to true.
   */
  persist?: boolean;
}

/**
 * Applies one brand × colour-mode theme to <html>, the only place it works:
 * overlays are portaled to <body> and component tokens resolve at :root.
 * Wrap the app in it once, and read or change the theme with `useTheme()`.
 */
export function ThemeProvider({
  children,
  brand: brandProp,
  defaultBrand = "iris",
  onBrandChange,
  theme: themeProp,
  defaultTheme = "light",
  onThemeChange,
  persist = true,
}: ThemeProviderProps) {
  const [stored] = useState(() => (persist ? readStored() : {}));
  const [brandState, setBrandState] = useState<BrandName>(
    stored.brand ?? defaultBrand,
  );
  const [themeState, setThemeState] = useState<ColorMode>(
    stored.theme ?? defaultTheme,
  );
  const brand = brandProp ?? brandState;
  const theme = themeProp ?? themeState;

  const setBrand = useCallback(
    (next: BrandName) => {
      if (brandProp === undefined) setBrandState(next);
      onBrandChange?.(next);
    },
    [brandProp, onBrandChange],
  );
  const setTheme = useCallback(
    (next: ColorMode) => {
      if (themeProp === undefined) setThemeState(next);
      onThemeChange?.(next);
    },
    [themeProp, onThemeChange],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      brand,
      theme,
      setBrand,
      setTheme,
      toggleTheme: () => setTheme(theme === "light" ? "dark" : "light"),
    }),
    [brand, theme, setBrand, setTheme],
  );

  // Remember the viewer's own choice (a per-device convenience, so storage
  // failures in private windows are fine to ignore). Controlled values
  // belong to the app, so they aren't saved.
  const saveBrand = brandProp === undefined ? brandState : undefined;
  const saveTheme = themeProp === undefined ? themeState : undefined;
  useLayoutEffect(() => {
    if (!persist || (saveBrand === undefined && saveTheme === undefined))
      return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ brand: saveBrand, theme: saveTheme }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [persist, saveBrand, saveTheme]);

  // Exactly one brand × mode theme goes on <html>, not on a wrapper.
  useLayoutEffect(() => {
    const className = stylex.props(
      styles.document,
      themes[brand][theme],
    ).className;
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
