import * as stylex from "@stylexjs/stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  brand,
  color,
  focus,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
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
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: space.sm,
  },
  /** Decorative mark: brand colours are for exactly this. */
  logo: {
    flexShrink: 0,
    width: size.controlSm,
    height: size.controlSm,
    borderRadius: radius.md,
    backgroundImage: `conic-gradient(from 210deg, ${brand.iris}, ${brand.coral}, ${brand.amber}, ${brand.mint}, ${brand.iris})`,
  },
  title: {
    margin: 0,
    fontFamily: fontFamily.display,
    fontSize: { default: fontSize.xl, [breakpoints.mobile]: fontSize.lg },
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  titleAccent: {
    backgroundImage: `linear-gradient(100deg, ${color.fgGradientStart}, ${color.fgGradientEnd})`,
    backgroundClip: "text",
    color: "transparent",
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
    color: color.fgDefault,
    backgroundColor: color.bgHover,
  },
  tabSelected: {
    color: color.fgAccent,
    backgroundColor: color.bgAccentSubtle,
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
