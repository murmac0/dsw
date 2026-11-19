import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { fontSize, fontWeight, lineHeight, size, space } from "@dsw/tokens/semantic.stylex";
import { alertShape as shape, alertTokens as t } from "@dsw/tokens/components.stylex";
import { Button } from "../Button/Button";
import { fieldStyles } from "../Field/Field.styles";

const styles = stylex.create({
  root: {
    boxSizing: "border-box",
    display: "flex",
    alignItems: "flex-start",
    gap: space.md,
    paddingBlock: space.md,
    paddingInline: space.lg,
    borderStyle: "solid",
    borderWidth: shape.borderWidth,
    borderRadius: shape.radius,
    boxShadow: shape.shadow,
    color: t.fg,
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal,
  },
  icon: {
    flexShrink: 0,
    width: size.icon,
    height: size.icon,
    // Optically centre on the first line of text.
    marginBlockStart: space.xxs,
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: space.xxs,
    overflowWrap: "break-word",
  },
  title: {
    margin: 0,
    fontWeight: fontWeight.semibold,
  },
  // The dismiss button is taller than a line: pull it into the padding.
  dismiss: {
    flexShrink: 0,
    marginBlock: `calc(-1 * ${space.xs})`,
    marginInlineEnd: `calc(-1 * ${space.sm})`,
  },
});

const toneStyles = stylex.create({
  info: { backgroundColor: t.infoBg, borderColor: t.infoBorder },
  success: { backgroundColor: t.successBg, borderColor: t.successBorder },
  warning: { backgroundColor: t.warningBg, borderColor: t.warningBorder },
  danger: { backgroundColor: t.dangerBg, borderColor: t.dangerBorder },
});

const iconToneStyles = stylex.create({
  info: { color: t.infoIcon },
  success: { color: t.successIcon },
  warning: { color: t.warningIcon },
  danger: { color: t.dangerIcon },
});

export type AlertTone = "info" | "success" | "warning" | "danger";

// A different shape per tone, so the icon tells them apart without colour.
const iconPaths: Record<AlertTone, string> = {
  info: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM8 7v4.5M8 4.75v.01",
  success: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM5.25 8.25l1.9 1.9 3.6-3.9",
  warning: "M8 1.75 1.25 13.5h13.5L8 1.75ZM8 6.25v3.5M8 11.6v.01",
  danger: "M5.3 1.5h5.4l3.8 3.8v5.4l-3.8 3.8H5.3l-3.8-3.8V5.3l3.8-3.8ZM5.75 5.75l4.5 4.5M10.25 5.75l-4.5 4.5",
};

const defaultToneLabel: Record<AlertTone, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "style" | "title"> {
  /** Defaults to "info". */
  tone?: AlertTone;
  /** Short summary in bold, e.g. "Payment failed". */
  title?: ReactNode;
  /** Detail: what happened and what to do next. */
  children?: ReactNode;
  /**
   * Announce the alert to screen readers when it appears or changes:
   * role="alert" for warning/danger, role="status" otherwise. Use it for
   * messages that appear in response to an action ("Saved"). Leave it
   * off for alerts present on page load, which would interrupt.
   */
  announce?: boolean;
  /** Shows a dismiss button. */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Defaults to "Dismiss". */
  dismissLabel?: string;
  /** Visually hidden prefix announced before the title ("Warning:"). Override to localise. */
  toneLabel?: string;
}

/**
 * An inline message about the page or an action: info, success, warning
 * or error. Status is carried by the icon's shape and a hidden prefix as
 * well as colour (WCAG 1.4.1). For a single field's error, use the
 * field's own `errorMessage` instead.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    tone = "info",
    title,
    children,
    announce = false,
    onDismiss,
    dismissLabel = "Dismiss",
    toneLabel,
    ...rest
  },
  ref,
) {
  const role = announce ? (tone === "warning" || tone === "danger" ? "alert" : "status") : undefined;
  return (
    <div
      {...(role && { role })}
      {...rest}
      ref={ref}
      data-tone={tone}
      {...stylex.props(styles.root, toneStyles[tone])}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" {...stylex.props(styles.icon, iconToneStyles[tone])}>
        <path
          d={iconPaths[tone]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div {...stylex.props(styles.content)}>
        {title != null ? (
          <p {...stylex.props(styles.title)}>
            <span {...stylex.props(fieldStyles.visuallyHidden)}>
              {toneLabel ?? defaultToneLabel[tone]}:{" "}
            </span>
            {title}
          </p>
        ) : (
          <span {...stylex.props(fieldStyles.visuallyHidden)}>
            {toneLabel ?? defaultToneLabel[tone]}:
          </span>
        )}
        {children}
      </div>
      {onDismiss && (
        <div {...stylex.props(styles.dismiss)}>
          <Button variant="ghost" size="sm" aria-label={dismissLabel} onPress={onDismiss}>
            <svg viewBox="0 0 16 16" aria-hidden="true" {...stylex.props(styles.icon)}>
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
});
