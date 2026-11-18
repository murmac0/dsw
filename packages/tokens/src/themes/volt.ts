import * as stylex from "@stylexjs/stylex";
import {
  buttonShape,
  buttonTokens,
  fieldTokens,
  selectionTokens,
  switchShape,
  switchTokens,
} from "../components.stylex";
import { voltPalette as v } from "../primitives.stylex";
import {
  borderWidth,
  brand,
  color,
  focus,
  fontWeight,
  fontFamily,
  letterSpacing,
  radius,
  shadow,
} from "../semantic.stylex";

/**
 * Volt — neo-brutalist.
 *
 * Square corners, 2px ink outlines, hard offset shadows, uppercase mono
 * buttons that press *into* the page. Acid lime is a fill, never a
 * boundary: lime on white is ~1.1:1, so every lime control is outlined in
 * ink and the outline carries the 3:1 non-text contrast.
 */

/* ---------- Colour: per mode ---------- */

const colorLight = stylex.createTheme(color, {
  bgCanvas: v.paper,
  bgSurface: v.white,
  bgSurfaceRaised: v.paperDeep,
  bgHover: v.paperDeep,
  bgAccentSubtle: v.limeWash,
  bgOverlay: "rgba(10, 10, 10, 0.55)",

  fgDefault: v.ink,
  fgMuted: v.inkSoft,
  fgDisabled: v.inkFaint,
  fgAccent: v.blue,
  fgOnAccent: v.ink,
  fgDanger: v.redText,
  fgOnDanger: v.ink,
  fgSuccess: v.green,
  fgGradientStart: v.ink,
  fgGradientEnd: v.blue,

  borderDefault: v.ink,
  borderStrong: v.ink,
  borderFocus: v.blue,

  accentDefault: v.lime,
  accentHover: v.limeDeep,
  accentActive: v.limeDeeper,
  accentDisabled: v.paperDeep,

  dangerDefault: v.red,
  dangerHover: v.redLight,
  successDefault: v.green,
});

const colorDark = stylex.createTheme(color, {
  bgCanvas: v.night,
  bgSurface: v.nightSurface,
  bgSurfaceRaised: v.nightRaised,
  bgHover: v.nightRaised,
  bgAccentSubtle: v.limeNight,
  bgOverlay: "rgba(0, 0, 0, 0.7)",

  fgDefault: v.bone,
  fgMuted: v.boneMuted,
  fgDisabled: v.boneFaint,
  fgAccent: v.lime,
  fgOnAccent: v.ink,
  fgDanger: v.redTextNight,
  fgOnDanger: v.ink,
  fgSuccess: v.greenNight,
  fgGradientStart: v.lime,
  fgGradientEnd: v.blueBright,

  borderDefault: v.bone,
  borderStrong: v.bone,
  borderFocus: v.lime,

  accentDefault: v.lime,
  accentHover: v.limeBright,
  accentActive: v.limeBrighter,
  accentDisabled: v.nightRaised,

  dangerDefault: v.redNight,
  dangerHover: v.redNightLight,
  successDefault: v.greenNight,
});

const brandLight = stylex.createTheme(brand, {
  iris: v.blue,
  coral: v.orange,
  mint: v.lime,
  amber: v.pink,
});

const brandDark = stylex.createTheme(brand, {
  iris: v.blueBright,
  coral: v.orange,
  mint: v.lime,
  amber: v.pink,
});

const shadowLight = stylex.createTheme(shadow, {
  popover: `6px 6px 0 0 ${v.ink}`,
  dialog: `10px 10px 0 0 ${v.ink}`,
  thumb: "none",
  card: `6px 6px 0 0 ${v.ink}`,
});

const shadowDark = stylex.createTheme(shadow, {
  popover: `6px 6px 0 0 ${v.lime}`,
  dialog: `10px 10px 0 0 ${v.lime}`,
  thumb: "none",
  card: `6px 6px 0 0 ${v.bone}`,
});

/* ---------- Shape and type: same in both modes ---------- */

const radiusVolt = stylex.createTheme(radius, {
  none: "0px",
  sm: "0px",
  md: "0px",
  lg: "0px",
  xl: "0px",
  full: "9999px",
});

const borderWidthVolt = stylex.createTheme(borderWidth, {
  thin: "2px",
  thick: "2px",
});

const focusVolt = stylex.createTheme(focus, {
  width: "3px",
  offset: "3px",
});

const fontFamilyVolt = stylex.createTheme(fontFamily, {
  display: '"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif',
  sans: '"Space Grotesk Variable", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono Variable", ui-monospace, Menlo, monospace',
});

const letterSpacingVolt = stylex.createTheme(letterSpacing, {
  tight: "-0.035em",
  normal: "0",
  wide: "0.08em",
});

// Component colours reference semantic tokens, so these work in both modes.
const buttonVolt = stylex.createTheme(buttonTokens, {
  primaryBg: color.accentDefault,
  primaryBgHover: color.accentHover,
  primaryBgPressed: color.accentActive,
  primaryFg: color.fgOnAccent,
  primaryBorder: color.borderStrong,
  secondaryBg: color.bgSurface,
  secondaryBgHover: color.bgHover,
  secondaryBorder: color.borderStrong,
  secondaryBorderHover: color.borderStrong,
  secondaryFg: color.fgDefault,
  ghostBgHover: color.bgHover,
  ghostFg: color.fgDefault,
  dangerBg: color.dangerDefault,
  dangerBgHover: color.dangerHover,
  dangerFg: color.fgOnDanger,
  dangerBorder: color.borderStrong,
  disabledBg: color.accentDisabled,
  disabledFg: color.fgDisabled,
});

const buttonShapeVolt = stylex.createTheme(buttonShape, {
  radius: radius.none,
  borderWidth: borderWidth.thin,
  fontFamily: fontFamily.mono,
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.wide,
  textTransform: "uppercase",
  shadow: `3px 3px 0 0 ${color.borderStrong}`,
  shadowPressed: `0 0 0 0 ${color.borderStrong}`,
  // Moves into its own shadow: the button visibly presses into the page.
  pressTransform: "translate(3px, 3px)",
});

const fieldVolt = stylex.createTheme(fieldTokens, {
  bg: color.bgSurface,
  fg: color.fgDefault,
  placeholder: color.fgMuted,
  icon: color.fgDefault,
  border: color.borderStrong,
  borderHover: color.borderStrong,
  borderFocus: color.borderFocus,
  // Darker than the danger fill (~3.1:1) for a real margin over 3:1.
  borderInvalid: color.fgDanger,
  label: color.fgDefault,
  description: color.fgMuted,
  error: color.fgDanger,
  required: color.fgDanger,
  disabledBg: color.bgSurfaceRaised,
  disabledBorder: color.fgDisabled,
  disabledFg: color.fgDisabled,
});

const selectionVolt = stylex.createTheme(selectionTokens, {
  bg: color.bgSurface,
  border: color.borderStrong,
  borderHover: color.borderStrong,
  checkedBg: color.accentDefault,
  checkedBgHover: color.accentHover,
  checkedBorder: color.borderStrong,
  mark: color.fgOnAccent,
  borderInvalid: color.fgDanger,
  label: color.fgDefault,
  disabledBg: color.bgSurfaceRaised,
  disabledBorder: color.fgDisabled,
  disabledMark: color.fgDisabled,
  disabledLabel: color.fgDisabled,
});

const switchVolt = stylex.createTheme(switchTokens, {
  trackOff: color.bgSurface,
  trackOffHover: color.bgHover,
  trackOn: color.accentDefault,
  trackOnHover: color.accentHover,
  thumb: color.fgDefault,
  thumbOn: color.fgOnAccent,
  trackOffEdge: color.borderStrong,
  trackOnEdge: color.borderStrong,
  thumbShadow: "none",
  label: color.fgDefault,
  trackDisabled: color.accentDisabled,
  disabledLabel: color.fgDisabled,
});

const switchShapeVolt = stylex.createTheme(switchShape, {
  trackRadius: "0px",
  thumbRadius: "0px",
  edgeWidth: "2px",
});

const shared = [
  radiusVolt,
  borderWidthVolt,
  focusVolt,
  fontFamilyVolt,
  letterSpacingVolt,
  buttonVolt,
  buttonShapeVolt,
  fieldVolt,
  selectionVolt,
  switchVolt,
  switchShapeVolt,
] as const;

export const voltTheme = {
  light: [colorLight, brandLight, shadowLight, ...shared],
  dark: [colorDark, brandDark, shadowDark, ...shared],
} as const;
