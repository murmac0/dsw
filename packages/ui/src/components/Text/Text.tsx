import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { fontFamily, fontSize, fontWeight, lineHeight } from "@dsw/tokens/semantic.stylex";
import { textTokens as t } from "@dsw/tokens/components.stylex";

const styles = stylex.create({
  root: {
    margin: 0,
    fontFamily: fontFamily.sans,
    lineHeight: lineHeight.normal,
    overflowWrap: "break-word",
  },
  mono: { fontFamily: fontFamily.mono },
});

const sizeStyles = stylex.create({
  xs: { fontSize: fontSize.xs },
  sm: { fontSize: fontSize.sm },
  md: { fontSize: fontSize.md },
  lg: { fontSize: fontSize.lg },
});

const toneStyles = stylex.create({
  default: { color: t.body },
  muted: { color: t.muted },
  accent: { color: t.accent },
  success: { color: t.success },
  warning: { color: t.warning },
  danger: { color: t.danger },
});

const weightStyles = stylex.create({
  regular: { fontWeight: fontWeight.regular },
  medium: { fontWeight: fontWeight.medium },
  semibold: { fontWeight: fontWeight.semibold },
});

export type TextSize = "xs" | "sm" | "md" | "lg";
export type TextTone = "default" | "muted" | "accent" | "success" | "warning" | "danger";
export type TextWeight = "regular" | "medium" | "semibold";

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style"> {
  /** Defaults to "md" (14px). */
  size?: TextSize;
  /**
   * Colour role. Every tone meets 4.5:1 on canvas and surface. Don't let
   * a tone carry meaning alone (WCAG 1.4.1): "Payment failed" in danger,
   * not just a red number.
   */
  tone?: TextTone;
  /** Defaults to "regular". */
  weight?: TextWeight;
  /** Monospace face, for codes, IDs and keys. */
  mono?: boolean;
  /** Element to render. Defaults to "p"; "span" inside other text. */
  as?: "p" | "span" | "div" | "strong" | "em" | "small" | "code";
  children?: ReactNode;
}

/** Body copy in the system's type scale and colour roles. */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { size = "md", tone = "default", weight = "regular", mono = false, as = "p", children, ...rest },
  ref,
) {
  const Tag = as as "p";
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLParagraphElement>}
      {...stylex.props(
        styles.root,
        sizeStyles[size],
        toneStyles[tone],
        weightStyles[weight],
        mono && styles.mono,
      )}
    >
      {children}
    </Tag>
  );
});
