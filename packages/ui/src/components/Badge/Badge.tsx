import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { borderWidth, fontSize, lineHeight, space } from "@dsw/tokens/semantic.stylex";
import { badgeShape as shape, badgeTokens as t } from "@dsw/tokens/components.stylex";

const styles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    flexShrink: 0,
    paddingBlock: space.xxs,
    paddingInline: space.sm,
    borderRadius: shape.radius,
    borderStyle: "solid",
    borderColor: t.border,
    // Washes vanish in forced-colour modes; an outline keeps the shape.
    borderWidth: { default: shape.borderWidth, [breakpoints.forcedColors]: borderWidth.thin },
    fontFamily: shape.fontFamily,
    fontSize: fontSize.xs,
    fontWeight: shape.fontWeight,
    letterSpacing: shape.letterSpacing,
    textTransform: shape.textTransform,
    lineHeight: lineHeight.normal,
    whiteSpace: "nowrap",
  },
});

const toneStyles = stylex.create({
  neutral: { backgroundColor: t.neutralBg, color: t.neutralFg },
  accent: { backgroundColor: t.accentBg, color: t.accentFg },
  success: { backgroundColor: t.successBg, color: t.successFg },
  warning: { backgroundColor: t.warningBg, color: t.warningFg },
  danger: { backgroundColor: t.dangerBg, color: t.dangerFg },
});

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "style"> {
  /** Colour role. Defaults to "neutral". The text must say the status too: tone is a reinforcement. */
  tone?: BadgeTone;
  /** A word or two: "Active", "Admin", "Beta". */
  children: ReactNode;
}

/**
 * A short, non-interactive status label. For a message, use Alert; for
 * something clickable, a Button or Link. Keep the text self-explanatory,
 * since the colour isn't announced.
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", children, ...rest },
  ref,
) {
  return (
    <span {...rest} ref={ref} {...stylex.props(styles.root, toneStyles[tone])}>
      {children}
    </span>
  );
});
