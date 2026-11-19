import * as stylex from "@stylexjs/stylex";
import { forwardRef, use, useId } from "react";
import type { ReactNode } from "react";
import { fieldsetShape as shape, fieldsetTokens as t } from "@dsw/tokens/components.stylex";
import { breakpoints } from "@dsw/tokens/breakpoints.stylex";
import { fontSize, lineHeight, space } from "@dsw/tokens/semantic.stylex";
import { FieldsetContext } from "./FieldsetContext";

const styles = stylex.create({
  root: {
    // Reset the UA fieldset box; min-inline-size stops the default
    // `min-content` from overflowing narrow layouts.
    margin: 0,
    padding: 0,
    borderWidth: 0,
    minInlineSize: 0,
  },
  boxed: {
    paddingBlock: { default: space.xl, [breakpoints.mobile]: space.lg },
    paddingInline: { default: space.xl, [breakpoints.mobile]: space.lg },
    borderRadius: shape.radius,
    borderWidth: shape.borderWidth,
    borderStyle: "solid",
    borderColor: t.border,
    backgroundColor: t.bg,
    boxShadow: shape.shadow,
  },
  boxedInvalid: {
    borderColor: t.borderInvalid,
  },
  legend: {
    // Floating the legend takes it out of the fieldset border's special
    // rendering so it lays out like a normal heading with real spacing.
    float: "left",
    width: "100%",
    padding: 0,
    marginBottom: space.sm,
    fontFamily: shape.legendFont,
    fontSize: fontSize.lg,
    fontWeight: shape.legendWeight,
    letterSpacing: shape.legendLetterSpacing,
    lineHeight: lineHeight.tight,
    color: t.legend,
  },
  legendDisabled: {
    color: t.disabledLegend,
  },
  body: {
    clear: "both",
    display: "flex",
    flexDirection: "column",
    gap: space.lg,
  },
  description: {
    margin: 0,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.normal,
    color: t.description,
  },
  // Outside the flex body so an empty error adds no gap.
  error: {
    margin: 0,
    fontSize: fontSize.sm,
    color: t.error,
  },
  errorShown: {
    marginTop: space.md,
  },
});

export type FieldsetVariant = "plain" | "boxed";

export interface FieldsetProps {
  /** Group label, announced when focus moves into the group. Required. */
  legend: ReactNode;
  /** Helper text for the whole group, linked via aria-describedby. */
  description?: ReactNode;
  /** Group-level error (e.g. "Enter a complete address"), shown when `isInvalid`. */
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  /** Disables every control inside, natively and visually. */
  isDisabled?: boolean;
  /** "plain" (default): a titled section. "boxed": a bordered panel. */
  variant?: FieldsetVariant;
  /** Native fieldset `name`, included in form.elements. */
  name?: string;
  children: ReactNode;
}

/**
 * Groups related fields under one announced label (WCAG 1.3.1).
 *
 * Use it when the group label is needed to understand a field: two
 * "Street" inputs for shipping and billing, or sections of a long form.
 * Radio and checkbox options already group themselves (RadioGroup,
 * CheckboxGroup); use Fieldset around *different* controls that belong
 * together.
 */
export const Fieldset = forwardRef<HTMLFieldSetElement, FieldsetProps>(
  function Fieldset(
    {
      legend,
      description,
      errorMessage,
      isInvalid = false,
      isDisabled = false,
      variant = "plain",
      name,
      children,
    },
    ref,
  ) {
    const parent = use(FieldsetContext);
    const disabled = isDisabled || parent.isDisabled;
    const id = useId();
    const descriptionId = description != null ? `${id}-description` : undefined;
    const showError = isInvalid && errorMessage != null;
    const errorId = `${id}-error`;

    return (
      <fieldset
        ref={ref}
        name={name}
        disabled={disabled}
        aria-describedby={
          [descriptionId, showError ? errorId : undefined].filter(Boolean).join(" ") ||
          undefined
        }
        data-invalid={isInvalid || undefined}
        data-disabled={disabled || undefined}
        {...stylex.props(
          styles.root,
          variant === "boxed" && styles.boxed,
          variant === "boxed" && isInvalid && styles.boxedInvalid,
        )}
      >
        <legend {...stylex.props(styles.legend, disabled && styles.legendDisabled)}>
          {legend}
        </legend>
        <div {...stylex.props(styles.body)}>
          {description != null && (
            <p id={descriptionId} {...stylex.props(styles.description)}>
              {description}
            </p>
          )}
          <FieldsetContext value={{ isDisabled: disabled }}>{children}</FieldsetContext>
        </div>
        {/*
          Always rendered (empty when valid, never display:none) so the live
          region is in the accessibility tree before its content changes,
          and a group error that appears after submit is announced. A div,
          not a <p>: an empty paragraph is a "blank" stop in browse mode.
        */}
        <div
          id={errorId}
          aria-live="polite"
          {...stylex.props(styles.error, showError && styles.errorShown)}
        >
          {showError ? errorMessage : null}
        </div>
      </fieldset>
    );
  },
);
