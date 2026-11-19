import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { size } from "@dsw/tokens/semantic.stylex";
import { gapStyles, type LayoutElement, type Space } from "../Stack/space";

const styles = stylex.create({
  root: {
    display: "grid",
    minWidth: 0,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  // As many columns as fit at the minimum width; min() keeps a single
  // column from overflowing a container narrower than the minimum.
  auto: {
    gridTemplateColumns: `repeat(auto-fill, minmax(min(${size.gridMin}, 100%), 1fr))`,
  },
});

// Fixed counts apply from tablet up; phones always get one column.
const columnStyles = stylex.create({
  one: { gridTemplateColumns: "minmax(0, 1fr)" },
  two: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.tablet]: "repeat(2, minmax(0, 1fr))",
    },
  },
  three: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.tablet]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.desktop]: "repeat(3, minmax(0, 1fr))",
    },
  },
  four: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.tablet]: "repeat(2, minmax(0, 1fr))",
      [breakpoints.desktop]: "repeat(4, minmax(0, 1fr))",
    },
  },
});

export type GridColumns = "auto" | 1 | 2 | 3 | 4;

const columnKey = { 1: "one", 2: "two", 3: "three", 4: "four" } as const;

export interface GridProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style"> {
  /**
   * "auto" (default): as many columns as fit at `size.gridMin` (240px).
   * A number: that many from tablet width up (3 and 4 step down through
   * 2), one column on phones.
   */
  columns?: GridColumns;
  /** Space between cells, from the spacing scale. Defaults to "lg". */
  gap?: Space;
  /** Element to render. Defaults to "div". */
  as?: LayoutElement;
  children?: ReactNode;
}

/**
 * Responsive grid for cards and tiles. Columns collapse on narrow
 * screens on their own, so no breakpoints are needed at the call site.
 */
export const Grid = forwardRef<HTMLElement, GridProps>(function Grid(
  { columns = "auto", gap = "lg", as = "div", children, ...rest },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      {...stylex.props(
        styles.root,
        columns === "auto" ? styles.auto : columnStyles[columnKey[columns]],
        gapStyles[gap],
      )}
    >
      {children}
    </Tag>
  );
});
