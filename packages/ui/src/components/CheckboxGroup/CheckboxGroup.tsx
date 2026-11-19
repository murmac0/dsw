import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
} from "react-aria-components";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldProps,
} from "../Field/Field";
import { fieldStyles, optionGroupStyles } from "../Field/Field.styles";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

export interface CheckboxGroupProps
  extends Omit<AriaCheckboxGroupProps, "children" | "className" | "style">,
    FieldProps {
  /** `Checkbox` elements, each with a `value`. */
  children: ReactNode;
  /** Defaults to "vertical". */
  orientation?: "vertical" | "horizontal";
}

/**
 * A labelled set of related checkboxes with one array value, e.g.
 * "Notify me by: Email, SMS, Push". Announced as a group with its label,
 * description and error, and validated as a whole.
 *
 * `isRequired` means *at least one*: React Aria marks the checkboxes
 * required only while none is selected, so native validation blocks
 * submit with nothing ticked and clears as soon as one is.
 *
 * Controlled: `value` + `onChange` (string[]). Uncontrolled: `defaultValue`.
 */
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(
    { label, description, errorMessage, children, orientation = "vertical", ...rest },
    ref,
  ) {
    const isDisabled = useInheritedDisabled(rest.isDisabled);
    return (
      <AriaCheckboxGroup
        {...rest}
        {...(isDisabled !== undefined && { isDisabled })}
        ref={ref}
        {...stylex.props(fieldStyles.root)}
      >
        <FieldLabel isRequired={rest.isRequired} isDisabled={isDisabled} announceRequired>
          {label}
        </FieldLabel>
        <div
          {...stylex.props(
            optionGroupStyles.options,
            orientation === "horizontal" && optionGroupStyles.horizontal,
          )}
        >
          {children}
        </div>
        <FieldDescription>{description}</FieldDescription>
        <FieldError>{errorMessage}</FieldError>
      </AriaCheckboxGroup>
    );
  },
);
