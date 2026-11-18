import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import {
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  motion,
  size,
  space,
  zIndex,
} from "@dsw/tokens/semantic.stylex";
import { dialogShape as shape, dialogTokens as t } from "@dsw/tokens/components.stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";

const fadeIn = stylex.keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

const riseIn = stylex.keyframes({
  // token-exempt: entrance keyframe offsets
  from: { opacity: 0, transform: "translateY(8px) scale(0.98)" },
  to: { opacity: 1, transform: "none" },
});

const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: zIndex.overlay,
    display: "flex",
    justifyContent: "center",
    backgroundColor: t.overlay,
    // Frosted backdrop: keeps context visible but out of focus.
    backdropFilter: "blur(6px)", // token-exempt: backdrop blur radius
    // Phones: dock to the bottom edge like a sheet, where thumbs can reach
    // the actions.
    alignItems: { default: "center", [breakpoints.mobile]: "flex-end" },
    paddingInline: { default: space.lg, [breakpoints.mobile]: space.sm },
    paddingBlock: { default: space.lg, [breakpoints.mobile]: space.sm },
  },
  overlayEntering: {
    animationName: fadeIn,
    animationDuration: motion.medium,
    animationTimingFunction: motion.easeOut,
  },
  modal: {
    boxSizing: "border-box",
    width: "100%",
    maxHeight: `calc(100dvh - 2 * ${space.lg})`,
    overflowY: "auto",
    borderRadius: shape.radius,
    borderWidth: shape.borderWidth,
    borderStyle: "solid",
    borderColor: t.border,
    backgroundColor: t.bg,
    color: t.title,
    boxShadow: t.shadow,
  },
  modalEntering: {
    animationName: riseIn,
    animationDuration: motion.slow,
    animationTimingFunction: motion.emphasized,
  },
  sm: { maxWidth: size.dialogSm },
  md: { maxWidth: size.dialogMd },
  lg: { maxWidth: size.dialogLg },
  dialog: {
    display: "flex",
    flexDirection: "column",
    gap: space.md,
    padding: { default: space.xl, [breakpoints.mobile]: space.lg },
    outline: "none",
  },
  title: {
    margin: 0,
    fontFamily: fontFamily.display,
    fontSize: fontSize.display3,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.tight,
    lineHeight: lineHeight.tight,
  },
  body: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.normal,
    color: t.body,
  },
  footer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: space.sm,
    marginTop: space.sm,
    // Phones: full-width stacked actions, primary (last in source) on top.
    flexDirection: { default: "row", [breakpoints.mobile]: "column-reverse" },
    alignItems: { default: "center", [breakpoints.mobile]: "stretch" },
  },
});

export type DialogSize = "sm" | "md" | "lg";

export interface DialogProps {
  /** Rendered as the dialog's heading and used as its accessible name. */
  title: ReactNode;
  /**
   * Content. A function receives `close` so actions inside the dialog can
   * dismiss it without the caller managing open state.
   */
  children: ReactNode | ((opts: { close: () => void }) => ReactNode);
  /** Defaults to "md". */
  size?: DialogSize;
  /**
   * "alertdialog" for destructive confirmations: it can't be dismissed by
   * clicking outside, so the user has to make an explicit choice.
   */
  role?: "dialog" | "alertdialog";
  /**
   * Controlled open state. Pair with `onOpenChange`. Omit both (and use
   * `DialogTrigger`) for the uncontrolled form, where the trigger owns it.
   */
  isOpen?: boolean;
  /** Uncontrolled initial open state, e.g. a dialog shown on first load. */
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * Modal dialog. Focus is trapped while open, moved to the first focusable
 * element (or the dialog) on open, and restored to the trigger on close;
 * the page behind is made inert to assistive tech. Escape always closes.
 *
 * Usage: wrap a trigger Button and this component in `DialogTrigger`.
 */
export function Dialog({
  title,
  children,
  size = "md",
  role = "dialog",
  isOpen,
  defaultOpen,
  onOpenChange,
}: DialogProps) {
  const isDismissable = role !== "alertdialog";

  return (
    <ModalOverlay
      isDismissable={isDismissable}
      {...(isOpen !== undefined && { isOpen })}
      {...(defaultOpen !== undefined && { defaultOpen })}
      {...(onOpenChange && { onOpenChange })}
      className={(rp) =>
        stylex.props(styles.overlay, rp.isEntering && styles.overlayEntering)
          .className ?? ""
      }
    >
      <Modal
        className={(rp) =>
          stylex.props(styles.modal, styles[size], rp.isEntering && styles.modalEntering)
            .className ?? ""
        }
      >
        <AriaDialog role={role} {...stylex.props(styles.dialog)}>
          {({ close }) => (
            <>
              <Heading slot="title" {...stylex.props(styles.title)}>
                {title}
              </Heading>
              {typeof children === "function" ? children({ close }) : children}
            </>
          )}
        </AriaDialog>
      </Modal>
    </ModalOverlay>
  );
}

/** Body copy with the dialog's muted text treatment. */
export function DialogBody({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.body)}>{children}</div>;
}

/** Right-aligned action row. Put the primary action last. */
export function DialogFooter({ children }: { children: ReactNode }) {
  return <div {...stylex.props(styles.footer)}>{children}</div>;
}

export { DialogTrigger };
