import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import { selectionStyles as s } from "./Checkbox.styles";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";

export interface CheckboxProps
  extends Omit<AriaCheckboxProps, "children" | "className" | "style"> {
  children?: ReactNode;
}

/**
 * The visible box is decorative; React Aria renders a real, visually hidden
 * `<input type="checkbox">` inside the label, so native form submission,
 * `indeterminate`, and screen reader semantics all come for free.
 *
 * Controlled: `isSelected` + `onChange`. Uncontrolled: `defaultSelected`.
 * `isIndeterminate` is always controlled (it's a display state, not a value).
 */
export const Checkbox = forwardRef<HTMLLabelElement, CheckboxProps>(
  function Checkbox({ children, ...rest }, ref) {
    const isDisabled = useInheritedDisabled(rest.isDisabled);
    return (
      <AriaCheckbox
        {...rest}
        {...(isDisabled !== undefined && { isDisabled })}
        ref={ref}
        className={(rp) =>
          stylex.props(s.root, rp.isDisabled && s.rootDisabled).className ?? ""
        }
      >
        {(rp) => {
          const isOn = rp.isSelected || rp.isIndeterminate;
          return (
            <>
              <span
                aria-hidden="true"
                {...stylex.props(
                  s.indicator,
                  s.box,
                  !rp.isDisabled && rp.isHovered && s.indicatorHovered,
                  isOn && s.indicatorSelected,
                  isOn && !rp.isDisabled && rp.isHovered && s.indicatorSelectedHovered,
                  rp.isPressed && s.indicatorPressed,
                  rp.isInvalid && s.indicatorInvalid,
                  rp.isDisabled && s.indicatorDisabled,
                  rp.isFocusVisible && s.indicatorFocusVisible,
                )}
              >
                {rp.isIndeterminate ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                ) : rp.isSelected ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6.2 5 8.5l4.5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : null}
              </span>
              {children}
            </>
          );
        }}
      </AriaCheckbox>
    );
  },
);
