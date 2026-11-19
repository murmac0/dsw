import * as stylex from "@stylexjs/stylex";
import { colorPrimitives } from "./primitives.stylex";
import {
  borderWidth,
  color,
  fontFamily,
  fontWeight,
  letterSpacing,
  radius,
  shadow,
} from "./semantic.stylex";

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
 * Each component has two groups: `*Tokens` (colour, themed per mode) and
 * `*Shape` (radius, border weight, type, shadow, motion: themed per
 * brand). Splitting them is what lets a brand change a button's whole
 * character (pill vs square, uppercase mono vs sentence case) once, while
 * light/dark stays a colour-only concern.
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
  /** Invisible by default (matches the fill); brands can outline it. */
  primaryBorder: color.accentDefault,

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
  dangerBorder: color.dangerDefault,

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
  /**
   * The checked box's boundary: what carries 3:1 against the surface.
   * Matches the fill by default; brands with pale fills outline instead.
   */
  checkedBorder: color.accentDefault,
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
  /** Thumb on the off track; ≥3:1 against it (WCAG 1.4.11). */
  thumb: colorPrimitives.white,
  /** Thumb on the on track; may differ when no colour suits both. */
  thumbOn: colorPrimitives.white,
  /**
   * Track boundaries: what carries 3:1 against the surface. Drawn with
   * width `switchShape.edgeWidth` (0 by default, so the fill is the edge).
   */
  trackOffEdge: color.borderStrong,
  trackOnEdge: color.accentDefault,
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

/** Fieldset: a labelled group of related fields. */
export const fieldsetTokens = stylex.defineVars({
  legend: color.fgDefault,
  description: color.fgMuted,
  error: color.fgDanger,
  /** Boxed variant only. Decorative: the legend identifies the group. */
  bg: color.bgSurface,
  border: color.borderDefault,
  borderInvalid: color.dangerDefault,
  disabledLegend: color.fgDisabled,
});

/** Heading and Text. One tone per role, so a brand can retint headings alone. */
export const textTokens = stylex.defineVars({
  heading: color.fgDefault,
  body: color.fgDefault,
  muted: color.fgMuted,
  accent: color.fgAccent,
  success: color.fgSuccess,
  warning: color.fgWarning,
  danger: color.fgDanger,
});

/** Link. Always underlined, so colour alone never marks it (WCAG 1.4.1). */
export const linkTokens = stylex.defineVars({
  fg: color.fgAccent,
  fgHover: color.fgDefault,
});

/** Card: a surface that groups content. Its edge is decorative. */
export const cardTokens = stylex.defineVars({
  bg: color.bgSurface,
  border: color.borderDefault,
  /** Danger-zone cards. Decorative: the card's title says what it is. */
  borderDanger: color.dangerDefault,
});

/** Badge: a short status label. Each `*Fg` carries 4.5:1 on its `*Bg`. */
export const badgeTokens = stylex.defineVars({
  neutralBg: color.bgSurfaceRaised,
  neutralFg: color.fgMuted,
  accentBg: color.bgAccentSubtle,
  accentFg: color.fgAccent,
  successBg: color.bgSuccessSubtle,
  successFg: color.fgSuccess,
  warningBg: color.bgWarningSubtle,
  warningFg: color.fgWarning,
  dangerBg: color.bgDangerSubtle,
  dangerFg: color.fgDanger,
  /** Drawn only where a brand gives badges a border (`badgeShape.borderWidth`). */
  border: color.borderStrong,
});

/**
 * Alert: an inline message. Body text is `fg` on each tone's wash; the
 * icon (its shape differs per tone, so meaning never rests on colour)
 * carries 3:1. Borders are decorative.
 */
export const alertTokens = stylex.defineVars({
  fg: color.fgDefault,
  infoBg: color.bgAccentSubtle,
  infoBorder: color.fgAccent,
  infoIcon: color.fgAccent,
  successBg: color.bgSuccessSubtle,
  successBorder: color.fgSuccess,
  successIcon: color.fgSuccess,
  warningBg: color.bgWarningSubtle,
  warningBorder: color.fgWarning,
  warningIcon: color.fgWarning,
  dangerBg: color.bgDangerSubtle,
  dangerBorder: color.fgDanger,
  dangerIcon: color.fgDanger,
});

/** Tabs. The selected indicator carries 3:1 against the surface it sits on. */
export const tabsTokens = stylex.defineVars({
  fg: color.fgMuted,
  fgHover: color.fgDefault,
  bgHover: color.bgHover,
  fgSelected: color.fgAccent,
  indicator: color.accentDefault,
  /** The rule under the tab list. Decorative. */
  border: color.borderDefault,
  fgDisabled: color.fgDisabled,
});

/* ------------------------------------------------------------------ */
/* Shape: per-brand, mode-independent                                  */
/* ------------------------------------------------------------------ */

export const headingShape = stylex.defineVars({
  fontFamily: fontFamily.display,
  fontWeight: fontWeight.bold,
  letterSpacing: letterSpacing.tight,
});

export const linkShape = stylex.defineVars({
  fontWeight: fontWeight.medium,
  underlineThickness: "1px",
  underlineThicknessHover: "2px",
  underlineOffset: "0.2em",
});

export const cardShape = stylex.defineVars({
  radius: radius.lg,
  borderWidth: borderWidth.thin,
  shadow: shadow.card,
});

export const badgeShape = stylex.defineVars({
  radius: radius.full,
  /** 0 by default: the wash is the shape. */
  borderWidth: "0px",
  fontFamily: fontFamily.sans,
  fontWeight: fontWeight.semibold,
  letterSpacing: letterSpacing.normal,
  textTransform: "none",
});

export const alertShape = stylex.defineVars({
  radius: radius.md,
  borderWidth: borderWidth.thin,
  shadow: "none",
});

export const tabsShape = stylex.defineVars({
  /** Selected-tab bar. Drawn as a border so forced-colour modes keep it. */
  indicatorWidth: "2px",
  fontFamily: fontFamily.sans,
  fontWeight: fontWeight.semibold,
  letterSpacing: letterSpacing.normal,
  textTransform: "none",
});

export const buttonShape = stylex.defineVars({
  radius: radius.md,
  borderWidth: borderWidth.thin,
  fontFamily: fontFamily.sans,
  fontWeight: fontWeight.semibold,
  letterSpacing: letterSpacing.normal,
  textTransform: "none",
  /** Resting elevation; brutalist brands use a hard offset shadow. */
  shadow: "none",
  shadowPressed: "none",
  /** How the button moves when pressed. */
  pressTransform: "scale(0.98)",
});

export const fieldShape = stylex.defineVars({
  radius: radius.md,
  borderWidth: borderWidth.thin,
});

export const selectionShape = stylex.defineVars({
  /**
   * Checkbox corner. Deliberately *not* the brand radius scale: a rounder
   * brand (Bloom's sm is 8px) would turn an 18px box into a near-circle
   * that reads as a radio button. The square-vs-round shape is how users
   * tell multi-select from single-select, so it stays square-ish
   * everywhere. Radios are always circles.
   */
  boxRadius: "5px",
  borderWidth: borderWidth.thick,
});

export const switchShape = stylex.defineVars({
  trackRadius: radius.full,
  thumbRadius: radius.full,
  /** Outline around the track, drawn outside it so layout never shifts. */
  edgeWidth: "0px",
});

export const menuShape = stylex.defineVars({
  radius: radius.lg,
  itemRadius: radius.md,
  borderWidth: borderWidth.thin,
});

export const dialogShape = stylex.defineVars({
  radius: radius.xl,
  borderWidth: borderWidth.thin,
});

export const fieldsetShape = stylex.defineVars({
  /** Boxed variant. */
  radius: radius.lg,
  borderWidth: borderWidth.thin,
  shadow: "none",
  legendFont: fontFamily.display,
  legendWeight: fontWeight.bold,
  legendLetterSpacing: letterSpacing.tight,
});
