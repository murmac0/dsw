import * as stylex from "@stylexjs/stylex";

/**
 * Primitive tokens: raw value scales with no theme awareness.
 * Components never consume these directly — only semantic tokens
 * (see semantic.stylex.ts) map to them. This indirection is what
 * lets a new theme or brand be added without touching component code.
 *
 * Defined with stylex.defineConsts() rather than plain objects: StyleX's
 * compiler resolves defineVars()/createTheme() values through static AST
 * analysis only, so a plain exported object's properties aren't visible
 * to it across a file boundary. defineConsts() is StyleX's construct for
 * compiler-visible constants and is designed for exactly this.
 */

export const colorPrimitives = stylex.defineConsts({
  white: "#ffffff",
  gray50: "#f7f8fa",
  gray100: "#eceef1",
  gray200: "#d8dce2",
  gray300: "#b9c0ca",
  gray400: "#8d96a3",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2530",
  gray900: "#121620",
  black: "#05070a",

  blue400: "#5b9dff",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",

  red400: "#f87171",
  red500: "#ef4444",
  red600: "#dc2626",

  green400: "#4ade80",
  green500: "#22c55e",
  green600: "#16a34a",
});

export const spacePrimitives = stylex.defineConsts({
  px0_5: "2px",
  px1: "4px",
  px2: "8px",
  px3: "12px",
  px4: "16px",
  px5: "20px",
  px6: "24px",
  px8: "32px",
  px10: "40px",
  px12: "48px",
});

export const radiusPrimitives = stylex.defineConsts({
  none: "0px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  full: "9999px",
});

export const fontSizePrimitives = stylex.defineConsts({
  xs: "12px",
  sm: "13px",
  md: "14px",
  lg: "16px",
  xl: "18px",
  xxl: "22px",
});

export const sizePrimitives = stylex.defineConsts({
  px8: "8px",
  px16: "16px",
  px18: "18px",
  px20: "20px",
  px22: "22px",
  px32: "32px",
  px36: "36px",
  px40: "40px",
  px44: "44px",
  px48: "48px",
  px240: "240px",
  px280: "280px",
  px300: "300px",
  px400: "400px",
  px440: "440px",
  px520: "520px",
  px720: "720px",
  px960: "960px",
});

export const borderWidthPrimitives = stylex.defineConsts({
  px1: "1px",
  px1_5: "1.5px",
  px2: "2px",
});

export const fontWeightPrimitives = stylex.defineConsts({
  w400: "400",
  w500: "500",
  w600: "600",
  w700: "700",
});

export const lineHeightPrimitives = stylex.defineConsts({
  none: "1",
  tight: "1.3",
  normal: "1.5",
});

export const durationPrimitives = stylex.defineConsts({
  ms0: "0ms",
  ms120: "120ms",
  ms150: "150ms",
  ms180: "180ms",
  ms700: "700ms",
});

export const easingPrimitives = stylex.defineConsts({
  easeOut: "ease-out",
  linear: "linear",
  emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
});
