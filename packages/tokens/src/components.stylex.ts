import * as stylex from "@stylexjs/stylex";
import { colorPrimitives } from "./primitives.stylex";
import { color, shadow } from "./semantic.stylex";

/**
 * Component tokens: the third tier (primitive → semantic → component).
 *
 * Every colour a component paints comes from its own group here. Defaults
 * alias semantic tokens, so they follow the active theme automatically.
 * A theme overrides a component token directly only where the semantic
 * alias isn't right for that component (see themes/dark.ts: the switch).
 *
 * This is what lets a brand restyle one component, e.g. pill-shaped
 * secondary buttons with a tinted background, without touching the
 * semantic layer every other component shares.
 *
 * Aliases resolve where they're declared (:root), which is why themes are
 * applied to <html>. A theme class on a nested element would re-skin
 * semantic tokens but not the component aliases computed above it.
 */

export const buttonTokens = stylex.defineVars({
  primaryBg: color.accentDefault,
  primaryBgHover: color.accentHover,
  primaryBgPressed: color.accentActive,
  primaryFg: color.fgOnAccent,

  secondaryBg: color.bgSurface,
  secondaryBgHover: color.bgHover,
  secondaryBorder: color.borderDefault,
  secondaryBorderHover: color.borderStrong,
  secondaryFg: color.fgDefault,

  ghostBgHover: color.bgHover,
  ghostFg: color.fgDefault,

  dangerBg: color.dangerDefault,
  dangerBgHover: color.dangerHover,
  dangerFg: color.fgOnDanger,

  disabledBg: color.accentDisabled,
  disabledFg: color.fgDisabled,
});

/** TextField input and Select trigger: the "text-like control" surface. */
export const fieldTokens = stylex.defineVars({
  bg: color.bgSurface,
  fg: color.fgDefault,
  placeholder: color.fgMuted,
  /** Trailing icons (Select chevron). */
  icon: color.fgMuted,
  border: color.borderStrong,
  borderHover: color.fgMuted,
  borderFocus: color.borderFocus,
  borderInvalid: color.dangerDefault,

  label: color.fgDefault,
  description: color.fgMuted,
  error: color.fgDanger,
  required: color.fgDanger,

  disabledBg: color.bgSurfaceRaised,
  disabledBorder: color.borderDefault,
  disabledFg: color.fgDisabled,
});

/** Checkbox and Radio. */
export const selectionTokens = stylex.defineVars({
  bg: color.bgSurface,
  border: color.borderStrong,
  borderHover: color.fgMuted,
  checkedBg: color.accentDefault,
  checkedBgHover: color.accentHover,
  mark: color.fgOnAccent,
  borderInvalid: color.dangerDefault,
  label: color.fgDefault,

  disabledBg: color.bgSurfaceRaised,
  disabledBorder: color.borderDefault,
  disabledMark: color.fgDisabled,
  disabledLabel: color.fgDisabled,
});

export const switchTokens = stylex.defineVars({
  trackOff: color.borderStrong,
  trackOffHover: colorPrimitives.ink600,
  trackOn: color.accentDefault,
  trackOnHover: color.accentHover,
  /** Must hold ≥3:1 against both track colours (WCAG 1.4.11). */
  thumb: colorPrimitives.white,
  thumbShadow: shadow.thumb,
  label: color.fgDefault,

  trackDisabled: color.accentDisabled,
  disabledLabel: color.fgDisabled,
});

/** Select's popover + listbox. */
export const menuTokens = stylex.defineVars({
  bg: color.bgSurface,
  border: color.borderDefault,
  shadow: shadow.popover,
  itemFg: color.fgDefault,
  itemBgHover: color.bgHover,
  itemFgSelected: color.fgAccent,
  itemBgSelected: color.bgAccentSubtle,
  check: color.fgAccent,
  itemFgDisabled: color.fgDisabled,
});

export const dialogTokens = stylex.defineVars({
  bg: color.bgSurface,
  border: color.borderDefault,
  shadow: shadow.dialog,
  overlay: color.bgOverlay,
  title: color.fgDefault,
  body: color.fgMuted,
});
