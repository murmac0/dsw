import * as stylex from "@stylexjs/stylex";
import { forwardRef } from "react";
import type { ReactNode } from "react";
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from "react-aria-components";
import { Spinner } from "../Spinner/Spinner";
import { useInheritedDisabled } from "../Fieldset/FieldsetContext";
import { styles } from "./Button.styles";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const hoveredStyleByVariant = {
  primary: styles.hoveredPrimary,
  secondary: styles.hoveredSecondary,
  ghost: styles.hoveredGhost,
  danger: styles.hoveredDanger,
} as const satisfies Record<ButtonVariant, stylex.StyleXStyles>;

export interface ButtonProps
  extends Omit<AriaButtonProps, "children" | "className" | "style"> {
  /** Visual treatment. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Defaults to "md". */
  size?: ButtonSize;
  /**
   * Shows a spinner and blocks activation while true, but — unlike
   * `isDisabled` — keeps the button focusable so keyboard/AT users don't
   * lose their place when an action starts. Pass it (even as `false`)
   * from the start on any button that can load: that renders the live
   * region up front, which screen readers need in order to announce it.
   */
  isLoading?: boolean;
  children: ReactNode;
}

/**
 * Triggers an action. Use `primary` for the one main action in a view,
 * `secondary` for alternatives, `ghost` for low-emphasis actions and
 * `danger` for destructive ones (pair those with an alertdialog confirm).
 *
 * Press handling is React Aria's (mouse, touch, keyboard, AT unified). Use
 * `isLoading` rather than `isDisabled` while an action is in flight: it
 * keeps focus on the button and announces "Loading" without renaming it.
 * Inside a disabled Fieldset it disables automatically.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading: isLoadingProp,
      isDisabled: isDisabledProp,
      onPress,
      children,
      ...rest
    },
    ref,
  ) {
    const isDisabled = useInheritedDisabled(isDisabledProp) ?? false;
    const isLoading = isLoadingProp ?? false;
    // Only buttons that take part in loading need a live region. Rendering
    // one for every button left empty role="status" nodes all over forms.
    const announcesLoading = isLoadingProp !== undefined;
    const isBlockedByLoading = isLoading && !isDisabled;

    return (
      <>
        <AriaButton
          {...rest}
          {...(isBlockedByLoading ? { "aria-disabled": true } : {})}
          ref={ref}
          isDisabled={isDisabled}
          onPress={(event) => {
            if (isLoading) return;
            onPress?.(event);
          }}
          className={(renderProps) => {
            const isVisuallyDisabled = renderProps.isDisabled || isLoading;

            return stylex.props(
              styles.base,
              styles[variant],
              styles[size],
              !isVisuallyDisabled &&
                renderProps.isHovered &&
                hoveredStyleByVariant[variant],
              !isVisuallyDisabled && renderProps.isPressed && styles.pressed,
              !isVisuallyDisabled &&
                renderProps.isPressed &&
                (variant === "primary" ? styles.pressedPrimary : styles.pressedFlat),
              renderProps.isFocusVisible && styles.focusVisible,
              isVisuallyDisabled && styles.disabled,
            ).className ?? "";
          }}
        >
          <span {...stylex.props(isLoading && styles.hiddenLabel)}>
            {children}
          </span>
          {isLoading && <Spinner size={size} style={styles.spinner} />}
        </AriaButton>
        {/*
          Sibling, not a child of the button: nested text — even visually
          hidden — still feeds the button's accessible name computation,
          which would turn "Save" into "Save Loading" while loading.
        */}
        {announcesLoading && (
          <span
            {...stylex.props(styles.visuallyHiddenStatus)}
            role="status"
            aria-live="polite"
          >
            {isLoading ? "Loading" : ""}
          </span>
        )}
      </>
    );
  },
);
