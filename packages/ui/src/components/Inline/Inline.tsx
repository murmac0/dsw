import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { gapStyles, type LayoutElement, type Space } from "../Stack/space";

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "row",
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  wrap: { flexWrap: "wrap" },
  // Phones: become a column, children full width.
  stackOnMobile: {
    flexDirection: { default: "row", [breakpoints.mobile]: "column" },
    alignItems: { default: null, [breakpoints.mobile]: "stretch" },
  },
});

const alignStyles = stylex.create({
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
  baseline: { alignItems: "baseline" },
  stretch: { alignItems: "stretch" },
});

const justifyStyles = stylex.create({
  start: { justifyContent: "flex-start" },
  center: { justifyContent: "center" },
  end: { justifyContent: "flex-end" },
  between: { justifyContent: "space-between" },
});

export type InlineAlign = "start" | "center" | "end" | "baseline" | "stretch";
export type InlineJustify = "start" | "center" | "end" | "between";

export interface InlineProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style"> {
  /** Space between children, from the spacing scale. Defaults to "sm". */
  gap?: Space;
  /** Cross-axis (vertical) alignment. Defaults to "center". */
  align?: InlineAlign;
  /** Main-axis distribution. "between" pushes the first and last apart. Defaults to "start". */
  justify?: InlineJustify;
  /** Wrap onto new lines when out of room. Defaults to true, so rows reflow at 320px (WCAG 1.4.10). */
  wrap?: boolean;
  /** Turn into a full-width column on phones, e.g. a title with its actions. */
  stackOnMobile?: boolean;
  /** Element to render. Defaults to "div". */
  as?: LayoutElement;
  children?: ReactNode;
}

/**
 * Horizontal layout: a row of children with a token gap, wrapping by
 * default. Use it for button groups, toolbars, a title beside its actions,
 * or a label beside a badge.
 */
export const Inline = forwardRef<HTMLElement, InlineProps>(function Inline(
  {
    gap = "sm",
    align = "center",
    justify = "start",
    wrap = true,
    stackOnMobile = false,
    as = "div",
    children,
    ...rest
  },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      {...stylex.props(
        styles.root,
        wrap && styles.wrap,
        gapStyles[gap],
        alignStyles[align],
        justifyStyles[justify],
        stackOnMobile && styles.stackOnMobile,
      )}
    >
      {children}
    </Tag>
  );
});
