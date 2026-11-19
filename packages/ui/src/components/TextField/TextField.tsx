import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import {
  Input,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from "react-aria-components";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldProps,
} from "../Field/Field";
import { fieldStyles } from "../Field/Field.styles";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

export interface TextFieldProps
  extends Omit<AriaTextFieldProps, "children" | "className" | "style">,
    FieldProps {
  placeholder?: string;
}

/**
 * Controlled: `value` + `onChange`. Uncontrolled: `defaultValue` (read it on
 * submit via `name`). Don't pass both `value` and `defaultValue`.
 *
 * For fields that collect the user's own details (name, email, address,
 * phone), set `autoComplete` to the matching token, e.g. "email" or
 * "shipping street-address". WCAG 1.3.5 requires it, and it lets browsers
 * and assistive tech autofill and label the field.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, description, errorMessage, placeholder, ...rest },
    ref,
  ) {
    const isDisabled = useInheritedDisabled(rest.isDisabled);
    return (
      <AriaTextField
        {...rest}
        {...(isDisabled !== undefined && { isDisabled })}
        {...stylex.props(fieldStyles.root)}
      >
        <FieldLabel isRequired={rest.isRequired} isDisabled={isDisabled}>
          {label}
        </FieldLabel>
        <Input
          ref={ref}
          {...(placeholder !== undefined && { placeholder })}
          className={(rp) =>
            stylex.props(
              fieldStyles.control,
              !rp.isDisabled && rp.isHovered && fieldStyles.controlHovered,
              rp.isFocused && fieldStyles.controlFocused,
              rp.isInvalid && fieldStyles.controlInvalid,
              rp.isInvalid && rp.isFocused && fieldStyles.controlInvalidFocused,
              rp.isDisabled && fieldStyles.controlDisabled,
            ).className ?? ""
          }
        />
        <FieldDescription>{description}</FieldDescription>
        <FieldError>{errorMessage}</FieldError>
      </AriaTextField>
    );
  },
);
