import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
  type TabListProps as AriaTabListProps,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  type TabsProps as AriaTabsProps,
} from "react-aria-components";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import {
  borderWidth,
  color,
  focus,
  fontSize,
  motion,
  radius,
  space,
} from "@dsw/tokens/semantic.stylex";
import { tabsShape as shape, tabsTokens as t } from "@dsw/tokens/components.stylex";

const styles = stylex.create({
  tabs: {
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
    minWidth: 0,
  },
  list: {
    display: "flex",
    // Wrap rather than scroll: a scrolling strip hides tabs at 320px with
    // no cue that they're there (WCAG 1.4.10).
    flexWrap: "wrap",
    gap: space.xs,
    borderBottomStyle: "solid",
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: t.border,
  },
  tab: {
    // Selected state is a coloured bar, which forced-colour modes would
    // strip or (for a transparent border) paint on every tab. Opt out and
    // use system colours instead.
    forcedColorAdjust: "none",
    position: "relative",
    paddingBlock: space.sm,
    paddingInline: space.md,
    // Sit the bar on top of the list's rule.
    marginBlockEnd: `calc(-1 * ${borderWidth.thin})`,
    borderBottomStyle: "solid",
    borderBottomWidth: shape.indicatorWidth,
    borderBottomColor: "transparent",
    borderStartStartRadius: radius.sm,
    borderStartEndRadius: radius.sm,
    fontFamily: shape.fontFamily,
    fontSize: fontSize.sm,
    fontWeight: shape.fontWeight,
    letterSpacing: shape.letterSpacing,
    textTransform: shape.textTransform,
    color: { default: t.fg, [breakpoints.forcedColors]: "CanvasText" },
    backgroundColor: { default: null, [breakpoints.forcedColors]: "Canvas" },
    cursor: "pointer",
    userSelect: "none",
    outlineStyle: "none",
    transitionProperty: "color, background-color, border-color",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  tabHovered: {
    color: { default: t.fgHover, [breakpoints.forcedColors]: "CanvasText" },
    backgroundColor: { default: t.bgHover, [breakpoints.forcedColors]: "Canvas" },
  },
  tabSelected: {
    color: { default: t.fgSelected, [breakpoints.forcedColors]: "CanvasText" },
    borderBottomColor: { default: t.indicator, [breakpoints.forcedColors]: "Highlight" },
  },
  tabDisabled: {
    cursor: "not-allowed",
    color: { default: t.fgDisabled, [breakpoints.forcedColors]: "GrayText" },
  },
  focusRing: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: { default: `calc(-1 * ${focus.width})`, [breakpoints.forcedColors]: null },
    outlineColor: { default: color.borderFocus, [breakpoints.forcedColors]: "Highlight" },
  },
  panel: {
    minWidth: 0,
    borderRadius: radius.sm,
    outlineStyle: "none",
  },
});

export interface TabsProps extends Omit<AriaTabsProps, "className" | "style"> {
  children: ReactNode;
}

/**
 * Switches between views of one page: settings sections, a record's
 * details and history. Contains a TabList of Tabs and a TabPanel per tab,
 * matched by `id`. Arrow keys move between tabs (React Aria).
 *
 * Controlled: `selectedKey` + `onSelectionChange`. Uncontrolled:
 * `defaultSelectedKey`. For navigating between pages, use links instead.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs({ children, ...rest }, ref) {
  return (
    <AriaTabs {...rest} ref={ref} className={stylex.props(styles.tabs).className ?? ""}>
      {children}
    </AriaTabs>
  );
});

export interface TabListProps<T extends object = object>
  extends Omit<AriaTabListProps<T>, "className" | "style"> {
  /** Name for the tab list, e.g. "Settings sections". Required when there's no visible heading to point at. */
  "aria-label"?: string;
}

/** The row of tabs. Wraps onto a second line when space runs out. */
export function TabList<T extends object = object>(props: TabListProps<T>) {
  return <AriaTabList {...props} className={stylex.props(styles.list).className ?? ""} />;
}

export interface TabProps extends Omit<AriaTabProps, "className" | "style"> {
  /** Matches the `id` of its TabPanel. */
  id: string;
  children: ReactNode;
}

/** One tab. Keep labels to a word or two. */
export function Tab(props: TabProps) {
  return (
    <AriaTab
      {...props}
      className={(rp) =>
        stylex.props(
          styles.tab,
          !rp.isSelected && !rp.isDisabled && rp.isHovered && styles.tabHovered,
          rp.isSelected && styles.tabSelected,
          rp.isDisabled && styles.tabDisabled,
          rp.isFocusVisible && styles.focusRing,
        ).className ?? ""
      }
    />
  );
}

export interface TabPanelProps extends Omit<AriaTabPanelProps, "className" | "style"> {
  /** Matches the `id` of its Tab. */
  id: string;
  children: ReactNode;
}

/** The content for one tab. Only the selected panel is rendered. */
export function TabPanel(props: TabPanelProps) {
  return (
    <AriaTabPanel
      {...props}
      className={(rp) =>
        stylex.props(styles.panel, rp.isFocusVisible && styles.focusRing).className ?? ""
      }
    />
  );
}
