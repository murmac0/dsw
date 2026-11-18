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
 *
 * Colour ramps are generated in OKLCH (perceptually uniform lightness), so
 * the same step number has the same visual weight across hues: iris600 and
 * rose600 both carry white text at ~5:1. That's what lets the semantic layer
 * pick steps by rule rather than by eye. Contrast for every shipped pairing
 * is checked in-browser by the Foundations contrast audit (and its E2E test).
 */

export const colorPrimitives = stylex.defineConsts({
  white: "#ffffff",
  black: "#000000",

  // ink — Neutrals, tinted toward violet so greys feel part of the palette.
  ink50: "#f6f6ff",
  ink100: "#ebebfb",
  ink200: "#dadaee",
  ink300: "#c5c5dc",
  ink400: "#aaaac2",
  ink500: "#87889c",
  ink600: "#737489",
  ink700: "#5e5e70",
  ink800: "#494956",
  ink900: "#34343d",
  ink925: "#282839",
  ink950: "#1e1e26",
  ink960: "#161622",
  ink975: "#0e0e19",

  // iris — Primary. An electric violet.
  iris50: "#f6f6ff",
  iris100: "#eaebff",
  iris200: "#d8d8ff",
  iris300: "#c0c0ff",
  iris400: "#a2a0fe",
  iris500: "#847bff",
  iris600: "#6a58ee",
  iris700: "#554bbf",
  iris800: "#413f88",
  iris900: "#303251",
  iris950: "#1b1c35",

  // coral — Warm accent for highlights and illustration.
  coral50: "#fff4f2",
  coral100: "#ffe6e3",
  coral200: "#ffd0c8",
  coral300: "#ffb0a3",
  coral400: "#ff836e",
  coral500: "#ed593f",
  coral600: "#c6432a",
  coral700: "#a03b25",
  coral800: "#743525",
  coral900: "#492d26",
  coral950: "#2f1912",

  // rose — Danger.
  rose50: "#fff4f5",
  rose100: "#fee6e8",
  rose200: "#ffced2",
  rose300: "#feaeb6",
  rose400: "#ff7e8f",
  rose500: "#f44869",
  rose600: "#cc3352",
  rose700: "#a52f44",
  rose800: "#782e38",
  rose900: "#4b2b2d",
  rose950: "#301618",

  // mint — Success.
  mint50: "#e4fef3",
  mint100: "#bffde4",
  mint200: "#92f3ce",
  mint300: "#61e3b4",
  mint400: "#24c996",
  mint500: "#08aa7c",
  mint600: "#048b63",
  mint700: "#00724f",
  mint800: "#1b573e",
  mint900: "#253b30",
  mint950: "#12241b",

  // amber — Warning.
  amber50: "#fef6e6",
  amber100: "#ffeac6",
  amber200: "#fed693",
  amber300: "#fdb93f",
  amber400: "#e39d03",
  amber500: "#c08208",
  amber600: "#9f6906",
  amber700: "#845500",
  amber800: "#684102",
  amber900: "#45311a",
  amber950: "#2d1b07",
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
  sm: "6px",
  md: "10px",
  lg: "16px",
  xl: "22px",
  full: "9999px",
});

export const fontSizePrimitives = stylex.defineConsts({
  xs: "12px",
  sm: "13px",
  md: "14px",
  lg: "16px",
  xl: "18px",
  xxl: "22px",
  display3: "28px",
  display2: "36px",
  display1: "48px",
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

/**
 * Volt: neo-brutalist. Acid lime and electric blue on paper, ink-black
 * outlines. Pre-audited with the same pairings as the live audit.
 */
export const voltPalette = stylex.defineConsts({
  paper: "#f3f1e7",
  paperDeep: "#e9e6d8",
  white: "#ffffff",
  ink: "#0a0a0a",
  inkSoft: "#4a4943",
  inkFaint: "#a5a39a",
  night: "#0a0a0a",
  nightSurface: "#151515",
  nightRaised: "#222222",
  bone: "#f4f2e9",
  boneMuted: "#b4b2a7",
  boneFaint: "#5c5b55",
  lime: "#d4ff3a",
  limeDeep: "#c3f01f",
  limeDeeper: "#aedb00",
  limeBright: "#e2ff7a",
  limeBrighter: "#eeffb0",
  limeWash: "#efffc2",
  limeNight: "#26300a",
  blue: "#2433e8",
  blueBright: "#8fb8ff",
  red: "#ff5a47",
  redLight: "#ff7566",
  redNight: "#ff6a5a",
  redNightLight: "#ff8a7d",
  redText: "#c4122f",
  redTextNight: "#ff8576",
  green: "#006b3a",
  greenNight: "#5ee69a",
  pink: "#ff5cc8",
  orange: "#ff8a00",
});

/**
 * Bloom: editorial and organic. Forest green and terracotta on cream.
 */
export const bloomPalette = stylex.defineConsts({
  cream: "#f6f1e7",
  creamSurface: "#fffcf6",
  creamDeep: "#ece4d5",
  creamHover: "#efe8da",
  stone: "#8a8376",
  ink: "#1c2420",
  inkSoft: "#555f59",
  inkFaint: "#a8a59c",
  forest: "#1d6649",
  forestDeep: "#17563d",
  forestDeeper: "#114430",
  forestWash: "#dfeee5",
  terracotta: "#b0452a",
  terracottaDeep: "#963820",
  terracottaText: "#a3341d",
  gradientEnd: "#a8401f",
  night: "#0e1411",
  nightSurface: "#141c18",
  nightRaised: "#1d2721",
  nightBorder: "#2a3530",
  moss: "#7f8b84",
  parchment: "#f2ede3",
  parchmentMuted: "#b3b8ae",
  parchmentFaint: "#56605a",
  sage: "#8fd1ad",
  sageLight: "#a8dec1",
  sageLighter: "#c2ead4",
  sageNight: "#173428",
  salmon: "#f0907a",
  salmonLight: "#f4a996",
  salmonText: "#f2a48f",
  white: "#ffffff",
  gold: "#d9a441",
  sky: "#7fb3d5",
});
