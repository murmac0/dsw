import * as stylex from "@stylexjs/stylex";
import { buttonShape, switchTokens } from "../components.stylex";
import { bloomPalette as b } from "../primitives.stylex";
import {
  brand,
  color,
  fontFamily,
  fontWeight,
  letterSpacing,
  radius,
  shadow,
} from "../semantic.stylex";

/**
 * Bloom — editorial and organic.
 *
 * Fraunces (a soft, "wonky" variable serif) for display over Instrument
 * Sans, pill buttons, generous curves and warm diffuse shadows. Forest
 * green carries actions, terracotta carries danger and warmth. Most
 * component tokens are inherited unchanged: the brand comes through
 * semantic colour, radius and type alone.
 */

/* ---------- Colour: per mode ---------- */

const colorLight = stylex.createTheme(color, {
  bgCanvas: b.cream,
  bgSurface: b.creamSurface,
  bgSurfaceRaised: b.creamDeep,
  bgHover: b.creamHover,
  bgAccentSubtle: b.forestWash,
  bgOverlay: "rgba(28, 36, 32, 0.42)",

  fgDefault: b.ink,
  fgMuted: b.inkSoft,
  fgDisabled: b.inkFaint,
  fgAccent: b.forest,
  fgOnAccent: b.white,
  fgDanger: b.terracottaText,
  fgOnDanger: b.white,
  fgSuccess: b.forest,
  fgGradientStart: b.forest,
  fgGradientEnd: b.gradientEnd,

  borderDefault: b.creamDeep,
  borderStrong: b.stone,
  borderFocus: b.forest,

  accentDefault: b.forest,
  accentHover: b.forestDeep,
  accentActive: b.forestDeeper,
  accentDisabled: b.creamDeep,

  dangerDefault: b.terracotta,
  dangerHover: b.terracottaDeep,
  successDefault: b.forest,
});

const colorDark = stylex.createTheme(color, {
  bgCanvas: b.night,
  bgSurface: b.nightSurface,
  bgSurfaceRaised: b.nightRaised,
  bgHover: b.nightRaised,
  bgAccentSubtle: b.sageNight,
  bgOverlay: "rgba(4, 8, 6, 0.66)",

  fgDefault: b.parchment,
  fgMuted: b.parchmentMuted,
  fgDisabled: b.parchmentFaint,
  fgAccent: b.sage,
  fgOnAccent: b.night,
  fgDanger: b.salmonText,
  fgOnDanger: b.night,
  fgSuccess: b.sage,
  fgGradientStart: b.sage,
  fgGradientEnd: b.salmonText,

  borderDefault: b.nightBorder,
  borderStrong: b.moss,
  borderFocus: b.sage,

  accentDefault: b.sage,
  accentHover: b.sageLight,
  accentActive: b.sageLighter,
  accentDisabled: b.nightRaised,

  dangerDefault: b.salmon,
  dangerHover: b.salmonLight,
  successDefault: b.sage,
});

const brandLight = stylex.createTheme(brand, {
  iris: b.forest,
  coral: b.terracotta,
  mint: b.sage,
  amber: b.gold,
});

const brandDark = stylex.createTheme(brand, {
  iris: b.sage,
  coral: b.salmon,
  mint: b.sky,
  amber: b.gold,
});

const shadowLight = stylex.createTheme(shadow, {
  popover: "0 18px 40px -16px rgba(60, 42, 14, 0.28), 0 2px 6px rgba(60, 42, 14, 0.06)",
  dialog: "0 40px 80px -24px rgba(60, 42, 14, 0.38), 0 4px 12px rgba(60, 42, 14, 0.08)",
  thumb: "0 1px 3px rgba(28, 36, 32, 0.3)",
  card: "0 1px 2px rgba(60, 42, 14, 0.05), 0 16px 40px -20px rgba(60, 42, 14, 0.22)",
});

const shadowDark = stylex.createTheme(shadow, {
  popover: "0 18px 40px -16px rgba(0, 0, 0, 0.7)",
  dialog: "0 40px 80px -24px rgba(0, 0, 0, 0.75)",
  thumb: "0 1px 3px rgba(0, 0, 0, 0.5)",
  card: "0 1px 2px rgba(0, 0, 0, 0.3)",
});

/* ---------- Shape and type: same in both modes ---------- */

const radiusBloom = stylex.createTheme(radius, {
  none: "0px",
  sm: "8px",
  md: "14px",
  lg: "22px",
  xl: "30px",
  full: "9999px",
});

const fontFamilyBloom = stylex.createTheme(fontFamily, {
  display: '"Fraunces Variable", ui-serif, Georgia, "Times New Roman", serif',
  sans: '"Instrument Sans Variable", ui-sans-serif, system-ui, sans-serif',
  mono: '"Geist Mono Variable", ui-monospace, Menlo, monospace',
});

const letterSpacingBloom = stylex.createTheme(letterSpacing, {
  tight: "-0.015em",
  normal: "0.005em",
  wide: "0.06em",
});

const buttonShapeBloom = stylex.createTheme(buttonShape, {
  radius: radius.full,
  borderWidth: "1px",
  fontFamily: fontFamily.sans,
  fontWeight: fontWeight.medium,
  letterSpacing: letterSpacing.normal,
  textTransform: "none",
  shadow: "none",
  shadowPressed: "none",
  pressTransform: "scale(0.97)",
});

// The white thumb can't hold 3:1 on the pale dark-mode sage track, so the
// on-thumb follows fgOnAccent (white in light, near-black in dark).
const switchBloom = stylex.createTheme(switchTokens, {
  trackOff: color.borderStrong,
  trackOffHover: color.borderStrong,
  trackOn: color.accentDefault,
  trackOnHover: color.accentHover,
  thumb: b.white,
  thumbOn: color.fgOnAccent,
  trackOffEdge: color.borderStrong,
  trackOnEdge: color.accentDefault,
  thumbShadow: shadow.thumb,
  label: color.fgDefault,
  trackDisabled: color.accentDisabled,
  disabledLabel: color.fgDisabled,
});

const shared = [
  radiusBloom,
  fontFamilyBloom,
  letterSpacingBloom,
  buttonShapeBloom,
  switchBloom,
] as const;

export const bloomTheme = {
  light: [colorLight, brandLight, shadowLight, ...shared],
  dark: [colorDark, brandDark, shadowDark, ...shared],
} as const;
