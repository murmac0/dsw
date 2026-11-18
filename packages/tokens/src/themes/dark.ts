import * as stylex from "@stylexjs/stylex";
import { switchTokens } from "../components.stylex";
import { colorPrimitives } from "../primitives.stylex";
import { brand, color, shadow } from "../semantic.stylex";

/**
 * Dark theme. Overrides the semantic contract; component tokens alias it,
 * so they follow without restating every value. Two rules shape the
 * choices:
 *
 * - Accents get lighter, not just inverted: iris400 / rose400 fills carry
 *   ink975 text (8:1+) rather than white text on a mid tone, which can't
 *   reach 4.5:1 without going muddy.
 * - Surfaces step up in lightness as they come forward (canvas → surface →
 *   raised), because shadows barely read on dark backgrounds.
 */
const colorDark = stylex.createTheme(color, {
  bgCanvas: colorPrimitives.ink975,
  bgSurface: colorPrimitives.ink960,
  bgSurfaceRaised: colorPrimitives.ink925,
  bgHover: colorPrimitives.ink925,
  bgAccentSubtle: colorPrimitives.iris950,
  bgOverlay: "rgba(4, 4, 10, 0.66)",

  fgDefault: colorPrimitives.ink50,
  fgMuted: colorPrimitives.ink400,
  fgDisabled: colorPrimitives.ink600,
  fgAccent: colorPrimitives.iris300,
  fgOnAccent: colorPrimitives.ink975,
  fgDanger: colorPrimitives.rose300,
  fgOnDanger: colorPrimitives.ink975,
  fgSuccess: colorPrimitives.mint300,
  fgGradientStart: colorPrimitives.iris300,
  fgGradientEnd: colorPrimitives.coral300,

  borderDefault: colorPrimitives.ink900,
  borderStrong: colorPrimitives.ink500,
  borderFocus: colorPrimitives.iris400,

  accentDefault: colorPrimitives.iris400,
  accentHover: colorPrimitives.iris300,
  accentActive: colorPrimitives.iris200,
  accentDisabled: colorPrimitives.ink925,

  dangerDefault: colorPrimitives.rose400,
  dangerHover: colorPrimitives.rose300,
  successDefault: colorPrimitives.mint400,
});

const brandDark = stylex.createTheme(brand, {
  iris: colorPrimitives.iris400,
  coral: colorPrimitives.coral400,
  mint: colorPrimitives.mint400,
  amber: colorPrimitives.amber300,
});

const shadowDark = stylex.createTheme(shadow, {
  popover: "0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.02)",
  dialog: "0 32px 64px -16px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.03)",
  thumb: "0 1px 3px rgba(0, 0, 0, 0.5)",
  card: "0 1px 2px rgba(0, 0, 0, 0.3)",
});

/**
 * The switch's white thumb sits on the track, so both track colours must
 * hold ≥3:1 against white *and* the track must hold ≥3:1 against the
 * surface. iris400 (the dark accent) fails the first, so the on-track uses
 * iris500 here, and the off-track steps darker than the border it aliases.
 */
const switchDark = stylex.createTheme(switchTokens, {
  trackOff: colorPrimitives.ink600,
  trackOffHover: colorPrimitives.ink500,
  trackOn: colorPrimitives.iris500,
  trackOnHover: colorPrimitives.iris500,
  thumb: colorPrimitives.white,
  thumbShadow: shadow.thumb,
  label: color.fgDefault,
  trackDisabled: color.accentDisabled,
  disabledLabel: color.fgDisabled,
});

/** Apply with `stylex.props(darkTheme)` on <html>. */
export const darkTheme = [colorDark, brandDark, shadowDark, switchDark] as const;
