import * as stylex from "@stylexjs/stylex";
import { space } from "@dsw/tokens/semantic.stylex";

/** A step on the spacing scale. Layout components take these, never lengths. */
export type Space = "none" | "xxs" | "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export const gapStyles = stylex.create({
  none: { gap: 0 },
  xxs: { gap: space.xxs },
  xs: { gap: space.xs },
  sm: { gap: space.sm },
  md: { gap: space.md },
  lg: { gap: space.lg },
  xl: { gap: space.xl },
  xxl: { gap: space.xxl },
});

/** Elements a layout component may render as. */
export type LayoutElement =
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "nav"
  | "main"
  | "form"
  | "ul"
  | "ol"
  | "li";
