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
 * Semantic tokens: the only vocabulary components are allowed to consume.
 * Values here are the light theme (the default). Other themes override
 * this contract via stylex.createTheme — see ./themes.
 */
export const color = stylex.defineVars({
  bgCanvas: colorPrimitives.white,
  bgSurface: colorPrimitives.white,
  bgSurfaceRaised: colorPrimitives.gray50,
  bgOverlay: "rgba(5, 7, 10, 0.5)",

  fgDefault: colorPrimitives.gray900,
  fgMuted: colorPrimitives.gray600,
  fgOnAccent: colorPrimitives.white,
  fgDisabled: colorPrimitives.gray400,

  borderDefault: colorPrimitives.gray200,
  borderStrong: colorPrimitives.gray300,
  borderFocus: colorPrimitives.blue500,

  accentDefault: colorPrimitives.blue500,
  accentHover: colorPrimitives.blue600,
  accentActive: colorPrimitives.blue700,
  accentDisabled: colorPrimitives.gray200,

  dangerDefault: colorPrimitives.red500,
  dangerHover: colorPrimitives.red600,
  // Text-on-surface variant of danger. red500 on white is ~3.8:1, below
  // WCAG AA for body text, so error messages use the darker step.
  fgDanger: colorPrimitives.red600,

  successDefault: colorPrimitives.green500,
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
  full: radiusPrimitives.full,
});

export const fontSize = stylex.defineVars({
  xs: fontSizePrimitives.xs,
  sm: fontSizePrimitives.sm,
  md: fontSizePrimitives.md,
  lg: fontSizePrimitives.lg,
  xl: fontSizePrimitives.xl,
  xxl: fontSizePrimitives.xxl,
});

/**
 * Elevation for floating surfaces (popovers, dialogs). Shadows are
 * deliberately subtle and rely on a border for definition, so one value
 * reads correctly in both light and dark themes.
 */
export const shadow = stylex.defineVars({
  popover: "0 4px 16px rgba(5, 7, 10, 0.12), 0 1px 3px rgba(5, 7, 10, 0.08)",
  dialog: "0 16px 48px rgba(5, 7, 10, 0.24), 0 2px 6px rgba(5, 7, 10, 0.12)",
  /** Switch thumb: lifts it off the track. */
  thumb: "0 1px 2px rgba(5, 7, 10, 0.3)",
});

/**
 * Fixed dimensions. Control heights are responsive: on coarse (touch)
 * pointers they grow to 44px, the WCAG 2.5.5 / Apple HIG target size,
 * so every Button, TextField and Select gets touch-friendly hit areas
 * without a single component-level media query.
 */
export const size = stylex.defineVars({
  controlSm: {
    default: sizePrimitives.px32,
    "@media (pointer: coarse)": sizePrimitives.px40,
  },
  controlMd: {
    default: sizePrimitives.px40,
    "@media (pointer: coarse)": sizePrimitives.px44,
  },
  controlLg: sizePrimitives.px48,

  /** Checkbox / radio box. */
  indicator: {
    default: sizePrimitives.px18,
    "@media (pointer: coarse)": sizePrimitives.px22,
  },
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
 * system respects it automatically. `spin` is exempt: a loading spinner
 * is a functional status indicator, not decorative motion.
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
  spin: durationPrimitives.ms700,
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

export const fontFamily = stylex.defineVars({
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
});
