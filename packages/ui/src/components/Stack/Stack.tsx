import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { gapStyles, type LayoutElement, type Space } from "./space";

const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    // A list rendered as a Stack keeps its semantics but loses UA bullets.
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
});

const alignStyles = stylex.create({
  stretch: { alignItems: "stretch" },
  start: { alignItems: "flex-start" },
  center: { alignItems: "center" },
  end: { alignItems: "flex-end" },
});

export type StackAlign = "stretch" | "start" | "center" | "end";

export interface StackProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style"> {
  /** Space between children, from the spacing scale. Defaults to "md". */
  gap?: Space;
  /** Cross-axis alignment. Defaults to "stretch" (children fill the width). */
  align?: StackAlign;
  /** Element to render. Defaults to "div"; use "ul"/"ol" for lists of items. */
  as?: LayoutElement;
  children?: ReactNode;
}

/**
 * Vertical layout: children in a column with a token gap between them.
 * Use it instead of margins or a hand-written flex column, so spacing
 * always comes from the scale. For a row, use Inline; for a grid of
 * cards, Grid.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { gap = "md", align = "stretch", as = "div", children, ...rest },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      {...stylex.props(styles.root, gapStyles[gap], alignStyles[align])}
    >
      {children}
    </Tag>
  );
});
