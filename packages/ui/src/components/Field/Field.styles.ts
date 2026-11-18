import * as stylex from "@stylexjs/stylex";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  fontWeight,
  motion,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

/**
 * Shared anatomy for every form control: label → control → description →
 * error. Keeping these in one place is what makes TextField, Select,
 * RadioGroup etc. read as one system rather than a set of siblings that
 * happen to look alike.
 */
export const fieldStyles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: color.fgDefault,
  },
  labelDisabled: {
    color: color.fgDisabled,
  },
  requiredMark: {
    color: color.fgDanger,
    marginInlineStart: space.xxs,
  },
  description: {
    fontSize: fontSize.xs,
    color: color.fgMuted,
  },
  error: {
    fontSize: fontSize.xs,
    color: color.fgDanger,
  },

  // Text-like control surface (Input, Select trigger)
  control: {
    boxSizing: "border-box",
    height: size.controlMd,
    width: "100%",
    paddingInline: space.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.thin,
    borderStyle: "solid",
    borderColor: color.borderStrong,
    backgroundColor: color.bgSurface,
    color: color.fgDefault,
    fontFamily: "inherit",
    fontSize: fontSize.sm,
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
    "::placeholder": {
      color: color.fgMuted,
    },
  },
  controlHovered: {
    borderColor: color.fgMuted,
  },
  // Inputs show focus ring on any focus (not only focus-visible): a text
  // caret alone is too weak a signal of where typing will land.
  controlFocused: {
    borderColor: color.borderFocus,
    boxShadow: `0 0 0 ${borderWidth.thin} ${color.borderFocus}`,
  },
  controlInvalid: {
    borderColor: color.dangerDefault,
  },
  controlInvalidFocused: {
    boxShadow: `0 0 0 ${borderWidth.thin} ${color.dangerDefault}`,
  },
  controlDisabled: {
    cursor: "not-allowed",
    backgroundColor: color.bgSurfaceRaised,
    borderColor: color.borderDefault,
    color: color.fgDisabled,
  },

  focusRing: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },
});
