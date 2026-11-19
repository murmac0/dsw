import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { fontSize, lineHeight } from "@dsw/tokens/semantic.stylex";
import { headingShape as shape, textTokens as t } from "@dsw/tokens/components.stylex";

const styles = stylex.create({
  root: {
    margin: 0,
    fontFamily: shape.fontFamily,
    fontWeight: shape.fontWeight,
    letterSpacing: shape.letterSpacing,
    lineHeight: lineHeight.tight,
    color: t.heading,
    // Long words (URLs, German compounds) wrap instead of overflowing at 320px.
    overflowWrap: "break-word",
    textWrap: "balance",
  },
});

// Display sizes step down a size on phones so headings don't dominate.
const sizeStyles = stylex.create({
  display1: { fontSize: { default: fontSize.display1, [breakpoints.mobile]: fontSize.display2 } },
  display2: { fontSize: { default: fontSize.display2, [breakpoints.mobile]: fontSize.display3 } },
  display3: { fontSize: { default: fontSize.display3, [breakpoints.mobile]: fontSize.xxl } },
  xxl: { fontSize: fontSize.xxl },
  xl: { fontSize: fontSize.xl },
  lg: { fontSize: fontSize.lg },
  md: { fontSize: fontSize.md },
});

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type HeadingSize = "display1" | "display2" | "display3" | "xxl" | "xl" | "lg" | "md";

const defaultSize: Record<HeadingLevel, HeadingSize> = {
  1: "display2",
  2: "display3",
  3: "xl",
  4: "lg",
  5: "md",
  6: "md",
};

export interface HeadingProps
  extends Omit<HTMLAttributes<HTMLHeadingElement>, "className" | "style"> {
  /**
   * Document outline level (h1–h6). Required, because it's structure
   * that screen reader users navigate by: pick it from the page's outline,
   * never for its look. Use `size` to change the look.
   */
  level: HeadingLevel;
  /** Visual size, independent of level. Defaults by level (h1 → display2, h2 → display3, h3 → xl…). */
  size?: HeadingSize;
  children: ReactNode;
}

/**
 * A section heading in the brand's display face. Level and size are
 * separate so the outline stays correct when a design wants a small h2
 * or a large h3.
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level, size, children, ...rest },
  ref,
) {
  const Tag = `h${level}` as const;
  return (
    <Tag {...rest} ref={ref} {...stylex.props(styles.root, sizeStyles[size ?? defaultSize[level]])}>
      {children}
    </Tag>
  );
});
