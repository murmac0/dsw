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
import { fieldTokens as t } from "@dsw/tokens/components.stylex";

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
    color: t.label,
  },
  labelDisabled: {
    color: t.disabledFg,
  },
  requiredMark: {
    color: t.required,
    marginInlineStart: space.xxs,
  },
  description: {
    fontSize: fontSize.xs,
    color: t.description,
  },
  error: {
    fontSize: fontSize.xs,
    color: t.error,
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
    borderColor: t.border,
    backgroundColor: t.bg,
    color: t.fg,
    fontFamily: "inherit",
    fontSize: fontSize.sm,
    outline: "none",
    transitionProperty: "border-color, box-shadow",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
    "::placeholder": {
      color: t.placeholder,
    },
  },
  controlHovered: {
    borderColor: t.borderHover,
  },
  // Inputs show focus ring on any focus (not only focus-visible): a text
  // caret alone is too weak a signal of where typing will land.
  controlFocused: {
    borderColor: t.borderFocus,
    boxShadow: `0 0 0 ${borderWidth.thin} ${t.borderFocus}`,
  },
  controlInvalid: {
    borderColor: t.borderInvalid,
  },
  controlInvalidFocused: {
    boxShadow: `0 0 0 ${borderWidth.thin} ${t.borderInvalid}`,
  },
  controlDisabled: {
    cursor: "not-allowed",
    backgroundColor: t.disabledBg,
    borderColor: t.disabledBorder,
    color: t.disabledFg,
  },

  focusRing: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: color.borderFocus,
  },
});
