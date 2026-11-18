import * as stylex from "@stylexjs/stylex";
import { borderWidth, color, focus, fontSize, motion, radius, size, space } from "@dsw/tokens/semantic.stylex";

/**
 * Shared by Checkbox and Radio: both are "box + label" selection controls,
 * differing only in indicator shape.
 */
export const selectionStyles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    fontSize: fontSize.sm,
    color: color.fgDefault,
    cursor: "pointer",
    userSelect: "none",
  },
  rootDisabled: {
    cursor: "not-allowed",
    color: color.fgDisabled,
  },
  indicator: {
    boxSizing: "border-box",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: size.indicator,
    height: size.indicator,
    borderWidth: borderWidth.thick,
    borderStyle: "solid",
    borderColor: color.borderStrong,
    backgroundColor: color.bgSurface,
    color: color.fgOnAccent,
    transitionProperty: "background-color, border-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  box: {
    borderRadius: radius.sm,
  },
  circle: {
    borderRadius: radius.full,
  },
  indicatorHovered: {
    borderColor: color.fgMuted,
  },
  indicatorSelected: {
    backgroundColor: color.accentDefault,
    borderColor: color.accentDefault,
  },
  indicatorSelectedHovered: {
    backgroundColor: color.accentHover,
    borderColor: color.accentHover,
  },
  indicatorPressed: {
    transform: "scale(0.94)", // token-exempt: press micro-interaction
  },
  indicatorInvalid: {
    borderColor: color.dangerDefault,
  },
  indicatorDisabled: {
    backgroundColor: color.bgSurfaceRaised,
    borderColor: color.borderDefault,
    color: color.fgDisabled,
  },
  indicatorFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },
  radioDot: {
    width: size.indicatorDot,
    height: size.indicatorDot,
    borderRadius: radius.full,
    backgroundColor: "currentColor",
  },
});
