import * as stylex from "@stylexjs/stylex";

/**
 * Media-query constants. Breakpoints can't be CSS variables (custom
 * properties don't work inside @media conditions), so they're compile-time
 * constants instead, used as condition keys:
 *
 *   padding: { default: space.xl, [breakpoints.mobile]: space.lg }
 *
 * Mobile-first naming: `mobile` is "below tablet", the rest are min-widths.
 */
export const breakpoints = stylex.defineConsts({
  mobile: "@media (max-width: 639.98px)",
  tablet: "@media (min-width: 640px)",
  desktop: "@media (min-width: 1024px)",
  /** Touch-first devices: larger hit targets regardless of width. */
  coarsePointer: "@media (pointer: coarse)",
  reducedMotion: "@media (prefers-reduced-motion: reduce)",
});
