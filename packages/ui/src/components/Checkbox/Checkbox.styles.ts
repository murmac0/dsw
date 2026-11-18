import * as stylex from "@stylexjs/stylex";
import { borderWidth, color, focus, fontSize, motion, radius, size, space } from "@dsw/tokens/semantic.stylex";
import { selectionTokens as t } from "@dsw/tokens/components.stylex";

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
    color: t.label,
    cursor: "pointer",
    userSelect: "none",
  },
  rootDisabled: {
    cursor: "not-allowed",
    color: t.disabledLabel,
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
    borderColor: t.border,
    backgroundColor: t.bg,
    color: t.mark,
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
    borderColor: t.borderHover,
  },
  indicatorSelected: {
    backgroundColor: t.checkedBg,
    borderColor: t.checkedBg,
  },
  indicatorSelectedHovered: {
    backgroundColor: t.checkedBgHover,
    borderColor: t.checkedBgHover,
  },
  indicatorPressed: {
    transform: "scale(0.94)", // token-exempt: press micro-interaction
  },
  indicatorInvalid: {
    borderColor: t.borderInvalid,
  },
  indicatorDisabled: {
    backgroundColor: t.disabledBg,
    borderColor: t.disabledBorder,
    color: t.disabledMark,
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
