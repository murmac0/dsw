import * as stylex from "@stylexjs/stylex";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  fontWeight,
  lineHeight,
  motion,
  opacity,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

export const styles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: "transparent",
    fontFamily: "inherit",
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.none,
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
    transitionProperty: "background-color, border-color, color, opacity",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },

  // Variants
  primary: {
    backgroundColor: color.accentDefault,
    color: color.fgOnAccent,
  },
  secondary: {
    backgroundColor: color.bgSurfaceRaised,
    borderColor: color.borderDefault,
    color: color.fgDefault,
  },
  ghost: {
    backgroundColor: "transparent",
    color: color.fgDefault,
  },
  danger: {
    backgroundColor: color.dangerDefault,
    color: color.fgOnAccent,
  },

  // Interaction states, applied conditionally from React Aria render props
  // rather than as CSS pseudo-classes, since React Aria normalizes
  // hover/press/focus-visible across mouse, touch and keyboard itself.
  hoveredPrimary: { backgroundColor: color.accentHover },
  hoveredDanger: { backgroundColor: color.dangerHover },
  hoveredSecondary: { backgroundColor: color.bgSurface, borderColor: color.borderStrong },
  hoveredGhost: { backgroundColor: color.bgSurfaceRaised },

  pressed: { opacity: opacity.pressed },

  focusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },

  disabled: {
    cursor: "not-allowed",
    backgroundColor: color.accentDisabled,
    borderColor: color.accentDisabled,
    color: color.fgDisabled,
  },

  // Sizes
  sm: {
    height: size.controlSm,
    paddingInline: space.sm,
    fontSize: fontSize.xs,
  },
  md: {
    height: size.controlMd,
    paddingInline: space.md,
    fontSize: fontSize.sm,
  },
  lg: {
    height: size.controlLg,
    paddingInline: space.lg,
    fontSize: fontSize.md,
  },

  // Loading state
  hiddenLabel: {
    opacity: 0,
  },
  // Visually hidden but still reachable by assistive tech, for the
  // live-announcement region react-aria-components won't forward
  // aria-busy for us to set declaratively on the button itself.
  visuallyHiddenStatus: {
    position: "absolute",
    // Standard visually-hidden technique — fixed values, not design tokens.
    width: "1px", // token-exempt: visually-hidden technique
    height: "1px", // token-exempt: visually-hidden technique
    overflow: "hidden",
    whiteSpace: "nowrap",
    clip: "rect(0 0 0 0)",
  },
  spinner: {
    position: "absolute",
    insetInlineStart: "50%",
    insetBlockStart: "50%",
    transform: "translate(-50%, -50%)",
  },
});
