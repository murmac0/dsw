import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { size, space } from "@dsw/tokens/semantic.stylex";
import type { LayoutElement } from "../Stack/space";

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    width: "100%",
    marginInline: "auto",
  },
  // space.gutter tightens on phones by itself.
  padded: { paddingInline: space.gutter },
});

const widthStyles = stylex.create({
  content: { maxWidth: size.contentMax },
  form: { maxWidth: size.formMax },
  full: { maxWidth: "none" },
});

export type ContainerWidth = "content" | "form" | "full";

export interface ContainerProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style"> {
  /** "content" (960px, default), "form" (440px, for single-column forms) or "full". */
  width?: ContainerWidth;
  /** Responsive side padding (`space.gutter`). Defaults to true. */
  padded?: boolean;
  /** Element to render. Defaults to "div"; "main" for the page's main landmark. */
  as?: LayoutElement;
  children?: ReactNode;
}

/**
 * Centres page content at a readable maximum width, with side padding
 * that tightens on phones. Use one per page region, outermost.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { width = "content", padded = true, as = "div", children, ...rest },
  ref,
) {
  const Tag = as as "div";
  return (
    <Tag
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      {...stylex.props(styles.root, widthStyles[width], padded && styles.padded)}
    >
      {children}
    </Tag>
  );
});
