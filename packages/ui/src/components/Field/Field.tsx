import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import {
  FieldError as AriaFieldError,
  Label as AriaLabel,
  Text,
  type ValidationResult,
} from "react-aria-components";
import { fieldStyles } from "./Field.styles";

/** Props every labelled form control in the system shares. */
export interface FieldProps {
  /** Visible label. Required: placeholder-as-label is not supported. */
  label: ReactNode;
  /** Helper text shown under the control and linked via aria-describedby. */
  description?: ReactNode;
  /**
   * Shown when the field is invalid — either from `isInvalid` or from
   * native/`validate` validation. A function receives the validation
   * result, so built-in browser messages can be customised.
   */
  errorMessage?: ReactNode | ((validation: ValidationResult) => ReactNode);
}

export function FieldLabel({
  children,
  isRequired,
  isDisabled,
  announceRequired = false,
}: {
  children: ReactNode;
  isRequired?: boolean | undefined;
  isDisabled?: boolean | undefined;
  /**
   * Put "required" into the accessible name. For controls that can't carry
   * required themselves: a Select's trigger is a <button>, and ARIA doesn't
   * allow aria-required on a CheckboxGroup's role="group".
   */
  announceRequired?: boolean;
}) {
  return (
    <AriaLabel
      {...stylex.props(fieldStyles.label, isDisabled && fieldStyles.labelDisabled)}
    >
      {children}
      {/*
        The asterisk is always hidden, to avoid "Email star". Most controls
        carry required/aria-required themselves; the rest get real words.
      */}
      {isRequired && (
        <span {...stylex.props(fieldStyles.requiredMark)} aria-hidden="true">
          *
        </span>
      )}
      {isRequired && announceRequired && (
        // ", required" rather than " (required)": no reliance on leading
        // whitespace surviving name computation, and screen readers pause
        // on the comma ("Notify me by, required").
        <span {...stylex.props(fieldStyles.visuallyHidden)}>, required</span>
      )}
    </AriaLabel>
  );
}

export function FieldDescription({ children }: { children?: ReactNode }) {
  if (children == null) return null;
  return (
    <Text slot="description" {...stylex.props(fieldStyles.description)}>
      {children}
    </Text>
  );
}

export function FieldError({ children }: { children?: FieldProps["errorMessage"] }) {
  return (
    <AriaFieldError {...stylex.props(fieldStyles.error)}>{children}</AriaFieldError>
  );
}
