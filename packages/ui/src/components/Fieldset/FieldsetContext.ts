import { createContext, use } from "react";

/**
 * Carries a Fieldset's disabled state to the controls inside it.
 *
 * A native `<fieldset disabled>` already blocks its native inputs, but
 * React Aria tracks disabled state itself, so without this the controls
 * would be inert yet still *look* enabled (and Select/Button would keep
 * their hover and press styles).
 */
export const FieldsetContext = createContext<{ isDisabled: boolean }>({
  isDisabled: false,
});

/**
 * Disabled if the control says so *or* any enclosing Fieldset is disabled.
 * The fieldset must win: a native `<fieldset disabled>` disables its
 * inputs regardless, so `isDisabled={false}` inside one would otherwise
 * look enabled but be inert. Returns the control's own value (possibly
 * undefined) when no fieldset is disabled, so React Aria defaults stand.
 */
export function useInheritedDisabled(isDisabled: boolean | undefined): boolean | undefined {
  const fieldset = use(FieldsetContext);
  return fieldset.isDisabled ? true : isDisabled;
}
