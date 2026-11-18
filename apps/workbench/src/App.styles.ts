import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  fontWeight,
  radius,
  size,
  space,
} from "@dsw/tokens/semantic.stylex";

export const styles = stylex.create({
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.md,
    paddingInline: space.gutter,
    borderBottomWidth: borderWidth.thin,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderDefault,
  },
  title: {
    fontSize: { default: fontSize.lg, [breakpoints.mobile]: fontSize.md },
    fontWeight: fontWeight.bold,
    margin: 0,
  },
  tabList: {
    display: "flex",
    gap: space.sm,
    listStyle: "none",
    margin: 0,
    paddingBlock: space.sm,
    paddingInline: space.gutter,
    // Phones: tabs scroll sideways rather than wrapping or overflowing.
    overflowX: "auto",
    scrollbarWidth: "none",
    borderBottomWidth: borderWidth.thin,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderDefault,
  },
  tab: {
    flexShrink: 0,
    paddingBlock: space.sm,
    paddingInline: space.md,
    cursor: "pointer",
    borderRadius: radius.md,
    color: color.fgMuted,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    outlineOffset: focus.offset,
    userSelect: "none",
  },
  tabHovered: {
    backgroundColor: color.bgSurfaceRaised,
  },
  tabSelected: {
    color: color.fgDefault,
    backgroundColor: color.bgSurfaceRaised,
  },
  tabFocusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineColor: color.borderFocus,
  },
  main: {
    boxSizing: "border-box",
    paddingBlock: space.xl,
    paddingInline: space.gutter,
    maxWidth: size.contentMax,
    marginInline: "auto",
  },
});
