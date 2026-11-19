import * as stylex from "@stylexjs/stylex";
import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode, Ref } from "react";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { space } from "@dsw/tokens/semantic.stylex";
import { cardShape as shape, cardTokens as t } from "@dsw/tokens/components.stylex";
import { Heading, type HeadingLevel } from "../Heading/Heading";
import { Text } from "../Text/Text";

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    backgroundColor: t.bg,
    borderStyle: "solid",
    borderWidth: shape.borderWidth,
    borderColor: t.border,
    borderRadius: shape.radius,
    boxShadow: shape.shadow,
  },
  danger: { borderColor: t.borderDanger },
  header: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.md,
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: space.xs,
    minWidth: 0,
    // Fills the row beside the actions; they wrap underneath only when
    // both don't fit.
    flexGrow: 1,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: space.sm,
  },
  footer: {
    // Pinned to the bottom, so footers line up across cards in a Grid row.
    marginBlockStart: "auto",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: space.sm,
    borderTopStyle: "solid",
    borderTopWidth: shape.borderWidth,
    borderTopColor: t.border,
  },
});

const paddingStyles = stylex.create({
  md: { padding: space.lg, gap: space.lg },
  lg: {
    padding: { default: space.xl, [breakpoints.mobile]: space.lg },
    gap: { default: space.xl, [breakpoints.mobile]: space.lg },
  },
});

// The footer rule runs edge to edge: pull it out through the card padding.
const footerBleedStyles = stylex.create({
  md: {
    marginInline: `calc(-1 * ${space.lg})`,
    marginBlockEnd: `calc(-1 * ${space.lg})`,
    padding: space.lg,
  },
  lg: {
    marginInline: { default: `calc(-1 * ${space.xl})`, [breakpoints.mobile]: `calc(-1 * ${space.lg})` },
    marginBlockEnd: { default: `calc(-1 * ${space.xl})`, [breakpoints.mobile]: `calc(-1 * ${space.lg})` },
    paddingInline: { default: space.xl, [breakpoints.mobile]: space.lg },
    paddingBlock: space.lg,
  },
});

export type CardTone = "default" | "danger";
export type CardPadding = "md" | "lg";

export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, "className" | "style" | "title"> {
  /** Card heading. With `as="section"` it also names the region. */
  title?: ReactNode;
  /** Outline level for `title`. Defaults to 2; pick it from the page outline. */
  titleLevel?: HeadingLevel;
  /** Supporting text under the title. */
  description?: ReactNode;
  /** Controls beside the title (a Button, a Badge). Wrap underneath on narrow cards. */
  actions?: ReactNode;
  /** A footer row, right-aligned with a divider above: the card's Save/Cancel. */
  footer?: ReactNode;
  /** "danger" outlines a danger zone. The title must say so too. */
  tone?: CardTone;
  /** Inner spacing. Defaults to "lg". */
  padding?: CardPadding;
  /** Defaults to "div". "section" makes a named region landmark when there's a title. */
  as?: "div" | "section" | "article" | "li";
  children?: ReactNode;
}

/**
 * A surface that groups related content: a settings section, a summary,
 * an item in a grid. Forms inside a card sit on its surface, and every
 * form control is contrast-checked against it.
 */
export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    title,
    titleLevel = 2,
    description,
    actions,
    footer,
    tone = "default",
    padding = "lg",
    as = "div",
    children,
    ...rest
  },
  ref,
) {
  const titleId = useId();
  const Tag = as as "div";
  const hasHeader = title != null || description != null || actions != null;
  return (
    <Tag
      {...(as === "section" && title != null && { "aria-labelledby": titleId })}
      {...rest}
      ref={ref as Ref<HTMLDivElement>}
      {...stylex.props(styles.root, paddingStyles[padding], tone === "danger" && styles.danger)}
    >
      {hasHeader && (
        <div {...stylex.props(styles.header)}>
          {(title != null || description != null) && (
            <div {...stylex.props(styles.headerText)}>
              {title != null && (
                <Heading level={titleLevel} size="lg" id={titleId}>
                  {title}
                </Heading>
              )}
              {description != null && (
                <Text size="sm" tone="muted">
                  {description}
                </Text>
              )}
            </div>
          )}
          {actions != null && <div {...stylex.props(styles.actions)}>{actions}</div>}
        </div>
      )}
      {children}
      {footer != null && (
        <div {...stylex.props(styles.footer, footerBleedStyles[padding])}>{footer}</div>
      )}
    </Tag>
  );
});
