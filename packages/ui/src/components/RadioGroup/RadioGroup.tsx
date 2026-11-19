import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
} from "react-aria-components";
import { selectionStyles as s } from "../Checkbox/Checkbox.styles";
import {
  FieldDescription,
  FieldError,
  FieldLabel,
  type FieldProps,
} from "../Field/Field";
import { fieldStyles, optionGroupStyles as groupStyles } from "../Field/Field.styles";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

export interface RadioGroupProps
  extends Omit<AriaRadioGroupProps, "children" | "className" | "style">,
    FieldProps {
  children: ReactNode;
}

/**
 * Arrow keys move selection between options and Tab leaves the group as a
 * single stop — the roving-tabindex pattern, handled by React Aria.
 *
 * Controlled: `value` + `onChange`. Uncontrolled: `defaultValue`.
 */
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  function RadioGroup(
    { label, description, errorMessage, children, orientation = "vertical", ...rest },
    ref,
  ) {
    const isDisabled = useInheritedDisabled(rest.isDisabled);
    return (
      <AriaRadioGroup
        {...rest}
        {...(isDisabled !== undefined && { isDisabled })}
        ref={ref}
        orientation={orientation}
        {...stylex.props(fieldStyles.root)}
      >
        <FieldLabel isRequired={rest.isRequired} isDisabled={isDisabled}>
          {label}
        </FieldLabel>
        <div
          {...stylex.props(
            groupStyles.options,
            orientation === "horizontal" && groupStyles.horizontal,
          )}
        >
          {children}
        </div>
        <FieldDescription>{description}</FieldDescription>
        <FieldError>{errorMessage}</FieldError>
      </AriaRadioGroup>
    );
  },
);

export interface RadioProps
  extends Omit<AriaRadioProps, "children" | "className" | "style"> {
  children?: ReactNode;
}

/**
 * One option in a RadioGroup. Must be a descendant of RadioGroup, which
 * owns the value, label and keyboard behaviour; give each a unique `value`.
 */
export const Radio = forwardRef<HTMLLabelElement, RadioProps>(function Radio(
  { children, ...rest },
  ref,
) {
  return (
    <AriaRadio
      {...rest}
      ref={ref}
      className={(rp) =>
        stylex.props(s.root, rp.isDisabled && s.rootDisabled).className ?? ""
      }
    >
      {(rp) => (
        <>
          <span
            aria-hidden="true"
            {...stylex.props(
              s.indicator,
              s.circle,
              !rp.isDisabled && rp.isHovered && s.indicatorHovered,
              rp.isSelected && s.indicatorSelected,
              rp.isSelected && !rp.isDisabled && rp.isHovered && s.indicatorSelectedHovered,
              rp.isPressed && s.indicatorPressed,
              rp.isInvalid && s.indicatorInvalid,
              rp.isDisabled && s.indicatorDisabled,
              rp.isFocusVisible && s.indicatorFocusVisible,
            )}
          >
            {rp.isSelected && <span {...stylex.props(s.radioDot)} />}
          </span>
          {children}
        </>
      )}
    </AriaRadio>
  );
});
