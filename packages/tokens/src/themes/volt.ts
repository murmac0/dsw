import * as stylex from "@stylexjs/stylex";
import {
  alertShape,
  alertTokens,
  badgeShape,
  badgeTokens,
  buttonShape,
  buttonTokens,
  linkShape,
  tabsShape,
  tabsTokens,
  fieldsetShape,
  selectionShape,
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
  bgSuccessSubtle: v.greenWash,
  bgWarningSubtle: v.orangeWash,
  bgDangerSubtle: v.redWash,
  bgOverlay: "rgba(10, 10, 10, 0.55)",

  fgDefault: v.ink,
  fgMuted: v.inkSoft,
  fgDisabled: v.inkFaint,
  fgAccent: v.blue,
  fgOnAccent: v.ink,
  fgDanger: v.redText,
  fgOnDanger: v.ink,
  fgSuccess: v.green,
  fgWarning: v.orangeText,
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
  bgSuccessSubtle: v.greenWashNight,
  bgWarningSubtle: v.orangeWashNight,
  bgDangerSubtle: v.redWashNight,
  bgOverlay: "rgba(0, 0, 0, 0.7)",

  fgDefault: v.bone,
  fgMuted: v.boneMuted,
  fgDisabled: v.boneFaint,
  fgAccent: v.lime,
  fgOnAccent: v.ink,
  fgDanger: v.redTextNight,
  fgOnDanger: v.ink,
  fgSuccess: v.greenNight,
  fgWarning: v.orange,
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

const fieldsetShapeVolt = stylex.createTheme(fieldsetShape, {
  radius: radius.none,
  borderWidth: borderWidth.thin,
  shadow: shadow.card,
  legendFont: fontFamily.display,
  legendWeight: fontWeight.bold,
  legendLetterSpacing: letterSpacing.tight,
});

const selectionShapeVolt = stylex.createTheme(selectionShape, {
  boxRadius: "0px",
  borderWidth: borderWidth.thin,
});

const switchShapeVolt = stylex.createTheme(switchShape, {
  trackRadius: "0px",
  thumbRadius: "0px",
  edgeWidth: "2px",
});

// Badges become solid stickers: bright fills, ink text, ink outline.
const badgeVolt = stylex.createTheme(badgeTokens, {
  neutralBg: color.bgSurfaceRaised,
  neutralFg: color.fgDefault,
  accentBg: color.accentDefault,
  accentFg: color.fgOnAccent,
  successBg: v.greenNight,
  successFg: v.ink,
  warningBg: v.orange,
  warningFg: v.ink,
  dangerBg: v.red,
  dangerFg: v.ink,
  border: color.borderStrong,
});

const badgeShapeVolt = stylex.createTheme(badgeShape, {
  radius: radius.none,
  borderWidth: borderWidth.thin,
  fontFamily: fontFamily.mono,
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.wide,
  textTransform: "uppercase",
});

// Ink outlines on every tone; the wash and icon carry the status.
const alertVolt = stylex.createTheme(alertTokens, {
  fg: color.fgDefault,
  infoBg: color.bgAccentSubtle,
  infoBorder: color.borderStrong,
  infoIcon: color.fgAccent,
  successBg: color.bgSuccessSubtle,
  successBorder: color.borderStrong,
  successIcon: color.fgSuccess,
  warningBg: color.bgWarningSubtle,
  warningBorder: color.borderStrong,
  warningIcon: color.fgWarning,
  dangerBg: color.bgDangerSubtle,
  dangerBorder: color.borderStrong,
  dangerIcon: color.fgDanger,
});

const alertShapeVolt = stylex.createTheme(alertShape, {
  radius: radius.none,
  borderWidth: borderWidth.thin,
  shadow: `4px 4px 0 0 ${color.borderStrong}`,
});

// A lime bar is ~1.1:1 on paper, so the selected indicator is ink.
const tabsVolt = stylex.createTheme(tabsTokens, {
  fg: color.fgMuted,
  fgHover: color.fgDefault,
  bgHover: color.bgHover,
  fgSelected: color.fgDefault,
  indicator: color.borderStrong,
  border: color.borderDefault,
  fgDisabled: color.fgDisabled,
});

const tabsShapeVolt = stylex.createTheme(tabsShape, {
  indicatorWidth: "4px",
  fontFamily: fontFamily.mono,
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.wide,
  textTransform: "uppercase",
});

const linkShapeVolt = stylex.createTheme(linkShape, {
  fontWeight: fontWeight.bold,
  underlineThickness: "2px",
  underlineThicknessHover: "4px",
  underlineOffset: "0.18em",
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
  fieldsetShapeVolt,
  selectionShapeVolt,
  badgeVolt,
  badgeShapeVolt,
  alertVolt,
  alertShapeVolt,
  tabsVolt,
  tabsShapeVolt,
  linkShapeVolt,
] as const;

export const voltTheme = {
  light: [colorLight, brandLight, shadowLight, ...shared],
  dark: [colorDark, brandDark, shadowDark, ...shared],
} as const;
