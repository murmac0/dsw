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
  zIndex,
} from "@dsw/tokens/semantic.stylex";

const focusRing = {
  outlineStyle: { default: "none", ":focus-visible": "solid" },
  outlineWidth: focus.width,
  outlineColor: color.borderFocus,
  outlineOffset: focus.offset,
} as const;

export const styles = stylex.create({
  /** Hidden until focused: the first tab stop jumps past the navigation. */
  skipLink: {
    position: "absolute",
    zIndex: zIndex.popover,
    insetInlineStart: space.sm,
    top: { default: "-100vh", ":focus": space.sm }, // token-exempt: off-screen until focused
    paddingBlock: space.sm,
    paddingInline: space.md,
    borderRadius: radius.md,
    backgroundColor: color.bgSurfaceRaised,
    color: color.fgDefault,
    fontWeight: fontWeight.semibold,
    ...focusRing,
  },

  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.sm,
    paddingBlock: space.sm,
    paddingInline: space.gutter,
    borderBottomWidth: borderWidth.thin,
    borderBottomStyle: "solid",
    borderBottomColor: color.borderDefault,
    backgroundColor: color.bgSurface,
  },
  home: {
    display: "inline-flex",
    alignItems: "center",
    gap: space.sm,
    borderRadius: radius.md,
    color: color.fgDefault,
    textDecoration: "none",
    ...focusRing,
  },
  /** Decorative mark: brand colours are for exactly this. */
  logo: {
    flexShrink: 0,
    width: size.controlSm,
    height: size.controlSm,
    borderRadius: radius.md,
    backgroundImage: `conic-gradient(from 210deg, ${brand.iris}, ${brand.coral}, ${brand.amber}, ${brand.mint}, ${brand.iris})`,
  },
  siteName: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
  },
  controls: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.sm,
  },
  /** The menu button only exists below the desktop breakpoint. */
  menuButton: {
    display: { default: "contents", [breakpoints.desktop]: "none" },
  },

  layout: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      [breakpoints.desktop]: `${size.sidebar} minmax(0, 1fr)`,
    },
    alignItems: "start",
  },

  sidebar: {
    boxSizing: "border-box",
    paddingBlock: space.lg,
    paddingInline: space.md,
    borderTopWidth: 0,
    borderInlineStartWidth: 0,
    borderBottomWidth: { default: borderWidth.thin, [breakpoints.desktop]: 0 },
    borderInlineEndWidth: { default: 0, [breakpoints.desktop]: borderWidth.thin },
    borderStyle: "solid",
    borderColor: color.borderDefault,
    position: { default: "static", [breakpoints.desktop]: "sticky" },
    top: 0,
    maxHeight: { default: "none", [breakpoints.desktop]: "100dvh" }, // token-exempt: full viewport height
    minHeight: { default: "auto", [breakpoints.desktop]: "100dvh" }, // token-exempt: full viewport height
    overflowY: "auto",
  },
  /** Closed on phones and tablets until the menu button opens it. */
  sidebarClosed: {
    display: { default: "none", [breakpoints.desktop]: "block" },
  },
  navGroups: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  groupLabel: {
    margin: 0,
    marginBottom: space.xs,
    paddingInline: space.sm,
    color: color.fgMuted,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: letterSpacing.wide,
    textTransform: "uppercase",
  },
  navList: {
    display: "flex",
    flexDirection: "column",
    gap: space.xxs,
    margin: 0,
    padding: 0,
    listStyle: "none",
  },
  navLink: {
    display: "block",
    paddingBlock: space.xs,
    paddingInline: space.sm,
    borderRadius: radius.md,
    color: { default: color.fgMuted, ":hover": color.fgDefault },
    backgroundColor: { default: "transparent", ":hover": color.bgHover },
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textDecoration: "none",
    ...focusRing,
  },
  navLinkCurrent: {
    // The current page is a fill, which forced-colour modes strip: repaint
    // it in system Highlight colours there.
    forcedColorAdjust: "none",
    color: {
      default: color.fgAccent,
      ":hover": color.fgAccent,
      [breakpoints.forcedColors]: "HighlightText",
    },
    backgroundColor: {
      default: color.bgAccentSubtle,
      ":hover": color.bgAccentSubtle,
      [breakpoints.forcedColors]: "Highlight",
    },
    fontWeight: fontWeight.semibold,
  },

  main: {
    boxSizing: "border-box",
    minWidth: 0,
    paddingBlock: { default: space.xxl, [breakpoints.mobile]: space.xl },
    paddingInline: space.gutter,
    outline: "none",
  },
  content: {
    maxWidth: size.contentMax,
    marginInline: "auto",
  },
});
