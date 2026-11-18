import * as stylex from "@stylexjs/stylex";
import {
  color,
  focus,
  fontSize,
  lineHeight,
  motion,
  opacity,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";
import { buttonShape as shape, buttonTokens as t } from "@dsw/tokens/components.stylex";

export const styles = stylex.create({
  base: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
    borderRadius: shape.radius,
    borderWidth: shape.borderWidth,
    borderStyle: "solid",
    borderColor: "transparent",
    boxShadow: shape.shadow,
    fontFamily: shape.fontFamily,
    fontWeight: shape.fontWeight,
    letterSpacing: shape.letterSpacing,
    textTransform: shape.textTransform,
    lineHeight: lineHeight.none,
    whiteSpace: "nowrap",
    userSelect: "none",
    cursor: "pointer",
    transitionProperty:
      "background-color, border-color, color, opacity, transform, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },

  // Variants
  primary: {
    backgroundColor: t.primaryBg,
    borderColor: t.primaryBorder,
    color: t.primaryFg,
  },
  secondary: {
    backgroundColor: t.secondaryBg,
    borderColor: t.secondaryBorder,
    color: t.secondaryFg,
  },
  ghost: {
    backgroundColor: "transparent",
    color: t.ghostFg,
    // Ghost buttons stay flat in every brand.
    boxShadow: "none",
  },
  danger: {
    backgroundColor: t.dangerBg,
    borderColor: t.dangerBorder,
    color: t.dangerFg,
  },

  // Interaction states, applied conditionally from React Aria render props
  // rather than as CSS pseudo-classes, since React Aria normalizes
  // hover/press/focus-visible across mouse, touch and keyboard itself.
  hoveredPrimary: { backgroundColor: t.primaryBgHover },
  hoveredDanger: { backgroundColor: t.dangerBgHover },
  hoveredSecondary: {
    backgroundColor: t.secondaryBgHover,
    borderColor: t.secondaryBorderHover,
  },
  hoveredGhost: { backgroundColor: t.ghostBgHover },

  pressed: {
    transform: shape.pressTransform,
    boxShadow: shape.shadowPressed,
  },
  pressedPrimary: { backgroundColor: t.primaryBgPressed },
  pressedFlat: { opacity: opacity.pressed },

  focusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },

  disabled: {
    cursor: "not-allowed",
    backgroundColor: t.disabledBg,
    borderColor: t.disabledBg,
    color: t.disabledFg,
    boxShadow: "none",
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
