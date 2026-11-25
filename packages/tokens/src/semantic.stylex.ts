import * as stylex from "@stylexjs/stylex";
import {
  borderWidthPrimitives,
  colorPrimitives,
  durationPrimitives,
  easingPrimitives,
  fontSizePrimitives,
  fontWeightPrimitives,
  lineHeightPrimitives,
  radiusPrimitives,
  sizePrimitives,
  spacePrimitives,
} from "./primitives.stylex";

/**
 * Semantic tokens: the vocabulary components (via component tokens) and
 * apps consume. Values here are the light theme (the default). Other
 * themes override this contract via stylex.createTheme — see ./themes.
 */
export const color = stylex.defineVars({
  // Surfaces, back to front
  bgCanvas: colorPrimitives.ink50,
  bgSurface: colorPrimitives.white,
  bgSurfaceRaised: colorPrimitives.ink100,
  /** Hover wash for rows, menu items, ghost buttons. */
  bgHover: colorPrimitives.ink100,
  /** Tinted wash for selected / highlighted items. */
  bgAccentSubtle: colorPrimitives.iris100,
  /**
   * Status washes (alerts, badges). Each carries its matching `fg*` status
   * colour and `fgDefault` at 4.5:1.
   */
  bgSuccessSubtle: colorPrimitives.mint50,
  bgWarningSubtle: colorPrimitives.amber50,
  bgDangerSubtle: colorPrimitives.rose50,
  bgOverlay: "rgba(14, 14, 25, 0.48)",

  // Text
  fgDefault: colorPrimitives.ink950,
  fgMuted: colorPrimitives.ink700,
  fgDisabled: colorPrimitives.ink400,
  fgAccent: colorPrimitives.iris700,
  fgOnAccent: colorPrimitives.white,
  fgDanger: colorPrimitives.rose700,
  fgOnDanger: colorPrimitives.white,
  fgSuccess: colorPrimitives.mint700,
  fgWarning: colorPrimitives.amber700,
  /**
   * Gradient text (display headings, wordmark). Both ends meet 4.5:1 on
   * canvas and surface, so the whole gradient is readable.
   */
  fgGradientStart: colorPrimitives.iris600,
  fgGradientEnd: colorPrimitives.coral600,

  // Borders
  /** Decorative dividers and surface edges (no contrast requirement). */
  borderDefault: colorPrimitives.ink200,
  /** Boundaries that identify a control: ≥3:1 against canvas and surface. */
  borderStrong: colorPrimitives.ink500,
  borderFocus: colorPrimitives.iris600,

  // Accent (primary actions, selected controls)
  accentDefault: colorPrimitives.iris600,
  accentHover: colorPrimitives.iris700,
  accentActive: colorPrimitives.iris800,
  accentDisabled: colorPrimitives.ink100,

  // Status
  dangerDefault: colorPrimitives.rose600,
  dangerHover: colorPrimitives.rose700,
  successDefault: colorPrimitives.mint600,
});

/**
 * Brand colours for decoration and illustration: wordmarks, gradients,
 * empty states, charts. Never for text or control boundaries; those use
 * `color`, which is contrast-audited.
 */
export const brand = stylex.defineVars({
  iris: colorPrimitives.iris500,
  coral: colorPrimitives.coral400,
  mint: colorPrimitives.mint400,
  amber: colorPrimitives.amber300,
});

export const space = stylex.defineVars({
  xxs: spacePrimitives.px0_5,
  xs: spacePrimitives.px1,
  sm: spacePrimitives.px2,
  md: spacePrimitives.px3,
  lg: spacePrimitives.px4,
  xl: spacePrimitives.px6,
  xxl: spacePrimitives.px8,
  /**
   * Responsive: horizontal page padding. Tighter on phones so content
   * keeps its width; components never need their own breakpoint for this.
   */
  gutter: {
    default: spacePrimitives.px6,
    "@media (max-width: 639.98px)": spacePrimitives.px4,
  },
});

export const radius = stylex.defineVars({
  none: radiusPrimitives.none,
  sm: radiusPrimitives.sm,
  md: radiusPrimitives.md,
  lg: radiusPrimitives.lg,
  /** Dialogs and hero cards. */
  xl: radiusPrimitives.xl,
  full: radiusPrimitives.full,
});

export const fontSize = stylex.defineVars({
  xs: fontSizePrimitives.xs,
  sm: fontSizePrimitives.sm,
  md: fontSizePrimitives.md,
  lg: fontSizePrimitives.lg,
  xl: fontSizePrimitives.xl,
  xxl: fontSizePrimitives.xxl,
  /** Display sizes: Bricolage Grotesque headings. */
  display1: fontSizePrimitives.display1,
  display2: fontSizePrimitives.display2,
  display3: fontSizePrimitives.display3,
});

export const letterSpacing = stylex.defineVars({
  /** Display type is optically loose at large sizes; tighten it. */
  tight: "-0.02em",
  normal: "0",
  /** Small caps / overline labels. */
  wide: "0.06em",
});

/**
 * Elevation for floating surfaces (popovers, dialogs). Shadows are
 * deliberately subtle and rely on a border for definition, so one value
 * reads correctly in both light and dark themes.
 */
export const shadow = stylex.defineVars({
  popover:
    "0 12px 32px -8px rgba(36, 24, 96, 0.18), 0 2px 6px rgba(14, 14, 25, 0.06)",
  dialog:
    "0 32px 64px -16px rgba(36, 24, 96, 0.32), 0 4px 12px rgba(14, 14, 25, 0.08)",
  /** Switch thumb: lifts it off the track. */
  thumb: "0 1px 3px rgba(14, 14, 25, 0.28)",
  /** Raised cards on the canvas. */
  card: "0 1px 2px rgba(14, 14, 25, 0.04), 0 8px 24px -12px rgba(36, 24, 96, 0.12)",
});

/**
 * Fixed dimensions. Control heights are the same on every device; the
 * smallest (controlSm, 32px) is above WCAG 2.5.8's 24px minimum target.
 */
export const size = stylex.defineVars({
  controlSm: sizePrimitives.px32,
  controlMd: sizePrimitives.px40,
  controlLg: sizePrimitives.px48,

  /** Checkbox / radio box. */
  indicator: sizePrimitives.px18,
  indicatorDot: sizePrimitives.px8,
  icon: sizePrimitives.px16,

  switchTrackWidth: sizePrimitives.px36,
  switchTrackHeight: sizePrimitives.px20,
  switchThumb: sizePrimitives.px16,

  popoverMaxHeight: sizePrimitives.px300,
  dialogSm: sizePrimitives.px400,
  dialogMd: sizePrimitives.px520,
  dialogLg: sizePrimitives.px720,

  /** Layout widths for app shells consuming the system. */
  contentMax: sizePrimitives.px960,
  formMax: sizePrimitives.px440,
  sidebar: sizePrimitives.px280,
  gridMin: sizePrimitives.px240,
});

export const borderWidth = stylex.defineVars({
  /** Surfaces, inputs, dividers. */
  thin: borderWidthPrimitives.px1,
  /** Small selection controls, where 1px reads as too faint. */
  thick: borderWidthPrimitives.px1_5,
});

/** One focus ring for the whole system. */
export const focus = stylex.defineVars({
  width: borderWidthPrimitives.px2,
  offset: borderWidthPrimitives.px2,
});

export const fontWeight = stylex.defineVars({
  regular: fontWeightPrimitives.w400,
  medium: fontWeightPrimitives.w500,
  semibold: fontWeightPrimitives.w600,
  bold: fontWeightPrimitives.w700,
});

export const lineHeight = stylex.defineVars({
  none: lineHeightPrimitives.none,
  tight: lineHeightPrimitives.tight,
  normal: lineHeightPrimitives.normal,
});

/**
 * Motion. Durations collapse to 0ms under prefers-reduced-motion here, at
 * the token level, so every transition and entrance animation in the
 * system respects it automatically. `spin` slows rather than stops: a
 * loading spinner is a functional status indicator, not decoration.
 */
export const motion = stylex.defineVars({
  fast: {
    default: durationPrimitives.ms120,
    "@media (prefers-reduced-motion: reduce)": durationPrimitives.ms0,
  },
  medium: {
    default: durationPrimitives.ms150,
    "@media (prefers-reduced-motion: reduce)": durationPrimitives.ms0,
  },
  slow: {
    default: durationPrimitives.ms180,
    "@media (prefers-reduced-motion: reduce)": durationPrimitives.ms0,
  },
  /**
   * Loading spinners keep turning under reduced motion (they're a status
   * indicator, so stopping them would hide that work is happening), but
   * at less than half the speed.
   */
  spin: {
    default: durationPrimitives.ms700,
    "@media (prefers-reduced-motion: reduce)": durationPrimitives.ms1800,
  },
  easeOut: easingPrimitives.easeOut,
  emphasized: easingPrimitives.emphasized,
  linear: easingPrimitives.linear,
});

export const opacity = stylex.defineVars({
  pressed: "0.85",
});

export const zIndex = stylex.defineVars({
  overlay: "100",
  popover: "110",
});

/**
 * Self-hosted variable fonts (see @dsw/tokens/fonts). Each stack falls back
 * to system fonts with similar metrics so text doesn't reflow badly if a
 * font fails to load.
 */
export const fontFamily = stylex.defineVars({
  /** Headings and display text: expressive, with an optical-size axis. */
  display:
    '"Bricolage Grotesque Variable", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  /** UI and body text: neutral and crisp at small sizes. */
  sans: '"Geist Variable", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"Geist Mono Variable", ui-monospace, "SF Mono", Menlo, Consolas, monospace',
});
