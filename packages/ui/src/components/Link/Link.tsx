import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { color, focus, motion, radius, size } from "@dsw/tokens/semantic.stylex";
import { linkShape as shape, linkTokens as t } from "@dsw/tokens/components.stylex";
import { fieldStyles } from "../Field/Field.styles";

const styles = stylex.create({
  root: {
    color: t.fg,
    fontWeight: shape.fontWeight,
    textDecorationLine: "underline",
    textDecorationThickness: shape.underlineThickness,
    textUnderlineOffset: shape.underlineOffset,
    borderRadius: radius.sm,
    cursor: "pointer",
    transitionProperty: "color, text-decoration-thickness",
    transitionDuration: motion.fast,
    transitionTimingFunction: motion.easeOut,
  },
  hovered: {
    color: t.fgHover,
    textDecorationThickness: shape.underlineThicknessHover,
  },
  focusVisible: {
    outlineStyle: "solid",
    outlineWidth: focus.width,
    outlineOffset: focus.offset,
    outlineColor: { default: color.borderFocus, [breakpoints.forcedColors]: "Highlight" },
  },
  icon: {
    display: "inline-block",
    width: `calc(${size.icon} * 0.75)`,
    height: `calc(${size.icon} * 0.75)`,
    verticalAlign: "baseline",
  },
});

export interface LinkProps extends Omit<AriaLinkProps, "className" | "style" | "children"> {
  /**
   * Opens in a new tab, and says so: adds an icon and "(opens in a new
   * tab)" for screen readers, plus rel="noopener noreferrer".
   */
  isExternal?: boolean;
  /** Visually hidden text announced for `isExternal`. Override to localise. */
  externalLabel?: string;
  children: ReactNode;
}

/**
 * Navigation to another page or place. Use Button for actions that don't
 * navigate. Always underlined, so it's identifiable without colour
 * (WCAG 1.4.1). Client-side routing works through React Aria's
 * RouterProvider.
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { isExternal = false, externalLabel = "(opens in a new tab)", children, ...rest },
  ref,
) {
  return (
    <AriaLink
      {...rest}
      {...(isExternal && { target: "_blank", rel: "noopener noreferrer" })}
      ref={ref}
      className={(rp) =>
        stylex.props(
          styles.root,
          rp.isHovered && styles.hovered,
          rp.isFocusVisible && styles.focusVisible,
        ).className ?? ""
      }
    >
      {children}
      {isExternal && (
        <>
          {/* A real space, outside the hidden span: accessible-name
              algorithms drop leading whitespace inside elements. */}
          {" "}
          <svg viewBox="0 0 16 16" aria-hidden="true" {...stylex.props(styles.icon)}>
            <path
              d="M6 3H3v10h10v-3M9 2h5v5M14 2 7 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span {...stylex.props(fieldStyles.visuallyHidden)}>{externalLabel}</span>
        </>
      )}
    </AriaLink>
  );
});
